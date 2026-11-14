export interface OpenCountSnapshot {
  code: string;
  opens: bigint;
}

export interface RedisOpenCountClient {
  scan(
    cursor: string | number,
    match: "MATCH",
    pattern: string,
    count: "COUNT",
    hint: number,
  ): Promise<[string, string[]]>;
  mget(...keys: string[]): Promise<(string | null)[]>;
}

const codePattern = /^opens:([a-z0-9]{7})$/;
const batchSize = 500;

export class RedisOpenCountReader {
  constructor(private readonly client: RedisOpenCountClient) {}

  async *batches(): AsyncGenerator<OpenCountSnapshot[]> {
    let cursor = "0";

    do {
      const [nextCursor, scannedKeys] = await this.client.scan(
        cursor,
        "MATCH",
        "opens:*",
        "COUNT",
        batchSize,
      );
      cursor = nextCursor;

      // COUNT is only a hint. Bound both the Redis read and Postgres update.
      for (let offset = 0; offset < scannedKeys.length; offset += batchSize) {
        const keys = scannedKeys
          .slice(offset, offset + batchSize)
          .filter((key) => codePattern.test(key));
        if (keys.length === 0) continue;

        const values = await this.client.mget(...keys);
        const snapshots: OpenCountSnapshot[] = [];

        for (const [index, key] of keys.entries()) {
          const value = values[index];
          if (value === null || !/^\d+$/.test(value)) continue;
          snapshots.push({ code: key.slice(6), opens: BigInt(value) });
        }

        if (snapshots.length > 0) yield snapshots;
      }
    } while (cursor !== "0");
  }
}
