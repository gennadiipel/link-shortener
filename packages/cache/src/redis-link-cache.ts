import type { Link, LinkCache } from "@lapinamk-ls/domain";
import { RedisClient } from "bun";

export interface RedisClientLike {
  del(...keys: string[]): Promise<number>;
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  set(key: string, value: string, ...options: string[]): Promise<unknown>;
}

export function createRedisClient(redisUrl: string): RedisClient {
  return new RedisClient(redisUrl);
}

export async function clearLinkCache(
  client: Pick<RedisClient, "del">,
  code: string,
): Promise<void> {
  await client.del(`url:${code}`, `opens:${code}`);
}

export class RedisLinkCache implements LinkCache {
  constructor(private readonly client: RedisClientLike) {}

  async getOpens(code: string): Promise<bigint | undefined> {
    const value = await this.client.get(`opens:${code}`);
    return value === null ? undefined : BigInt(value);
  }

  async clear(code: string): Promise<void> {
    await clearLinkCache(this.client, code);
  }

  async getTargetUrl(code: string): Promise<string | undefined> {
    return (await this.client.get(`url:${code}`)) ?? undefined;
  }

  async incrementOpens(code: string): Promise<void> {
    await this.client.incr(`opens:${code}`);
  }

  async repair(link: Link): Promise<void> {
    await Promise.all([
      this.client.set(`url:${link.code}`, link.targetUrl),
      this.client.set(`opens:${link.code}`, link.opens.toString(), "NX"),
    ]);
  }

  async set(link: Link): Promise<void> {
    await Promise.all([
      this.client.set(`url:${link.code}`, link.targetUrl),
      this.client.set(`opens:${link.code}`, "0"),
    ]);
  }
}
