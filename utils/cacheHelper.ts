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
