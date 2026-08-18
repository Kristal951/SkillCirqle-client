import { redis } from "@/lib/redis";

export async function getOrSetCache<T>(
  key: string,
  callback: () => Promise<T>,
  ttl = 300,
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached) {
    console.log("CACHE HIT");
    return cached;
  }

  console.log("CACHE MISS");

  const fresh = await callback();

  await redis.set(key, fresh, {
    ex: ttl,
  });

  return fresh;
}

export async function invalidateCache(key: string): Promise<void> {
  console.log(`invalidating cache with key: ${key}`)
  await redis.del(key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  let cursor = 0;
  const keysToDelete: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: pattern,
      count: 100,
    });
    keysToDelete.push(...keys);
    cursor = Number(nextCursor);
  } while (cursor !== 0);

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}
