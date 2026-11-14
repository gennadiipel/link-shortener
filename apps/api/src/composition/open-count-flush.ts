import type { OpenCountSnapshot } from "@lapinamk-ls/cache";

export interface OpenCountReader {
  batches(): AsyncIterable<OpenCountSnapshot[]>;
}

export interface OpenCountWriter {
  sync(snapshots: OpenCountSnapshot[]): Promise<void>;
}

const flushIntervalMs = 60_000;

export async function flushOpenCounts(
  reader: OpenCountReader,
  writer: OpenCountWriter,
): Promise<number> {
  let synced = 0;

  for await (const batch of reader.batches()) {
    await writer.sync(batch);
    synced += batch.length;
  }

  return synced;
}

export function startOpenCountFlush(
  reader: OpenCountReader,
  writer: OpenCountWriter,
  onError: (error: unknown) => void,
  intervalMs = flushIntervalMs,
): () => Promise<void> {
  let inFlight: Promise<void> | undefined;
  let stopped = false;

  const timer = setInterval(() => {
    if (stopped || inFlight) return;

    inFlight = flushOpenCounts(reader, writer)
      .then(() => {})
      .catch(onError)
      .finally(() => {
        inFlight = undefined;
      });
  }, intervalMs);

  return async () => {
    stopped = true;
    clearInterval(timer);
    await inFlight;
  };
}
