import { describe, expect, test } from "bun:test";
import {
  flushOpenCounts,
  startOpenCountFlush,
} from "../src/composition/open-count-flush";

describe("open-count flush", () => {
  test("replays every Redis snapshot, including repeated scan keys", async () => {
    const writes: bigint[] = [];
    const reader = {
      async *batches() {
        yield [{ code: "abc1234", opens: 5n }];
        yield [{ code: "abc1234", opens: 6n }];
      },
    };

    expect(
      await flushOpenCounts(reader, {
        sync: async (batch) => {
          const snapshot = batch[0];
          if (!snapshot) throw new Error("Expected a snapshot");
          writes.push(snapshot.opens);
        },
      }),
    ).toBe(2);
    expect(writes).toEqual([5n, 6n]);
  });

  test("does not overlap runs and waits for an active run on shutdown", async () => {
    let runs = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const stop = startOpenCountFlush(
      {
        async *batches() {
          runs += 1;
          await gate;
          yield [{ code: "abc1234", opens: 1n }];
        },
      },
      { sync: async () => {} },
      () => {},
      5,
    );

    await Bun.sleep(25);
    expect(runs).toBe(1);
    const stopping = stop();
    release();
    await stopping;
    await Bun.sleep(10);
    expect(runs).toBe(1);
  });

  test("reports failure and retries on the next tick", async () => {
    let attempts = 0;
    const errors: unknown[] = [];
    const stop = startOpenCountFlush(
      {
        async *batches() {
          attempts += 1;
          if (attempts === 1) throw new Error("database unavailable");
          yield [{ code: "abc1234", opens: 1n }];
        },
      },
      { sync: async () => {} },
      (error) => errors.push(error),
      5,
    );

    await Bun.sleep(35);
    await stop();
    expect(errors).toHaveLength(1);
    expect(attempts).toBeGreaterThan(1);
  });
});
