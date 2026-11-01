import type { Link, LinkCache } from "@lapinamk-ls/domain";
import { RedisClient } from "bun";

export interface RedisClientLike {
  set(key: string, value: string): Promise<unknown>;
}

export function createRedisClient(redisUrl: string): RedisClient {
  return new RedisClient(redisUrl);
}

export class RedisLinkCache implements LinkCache {
  constructor(private readonly client: RedisClientLike) {}

  async set(link: Link): Promise<void> {
    await Promise.all([
      this.client.set(`url:${link.code}`, link.targetUrl),
      this.client.set(`opens:${link.code}`, "0"),
    ]);
  }
}
