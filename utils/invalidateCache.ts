import { redis } from "@/lib/redis";

export async function invalidateProfileCache(userId: string) {
  await Promise.all([
    redis.del(`profile:${userId}`),
    redis.del(`profile:${userId}:with-skills`),
  ]);
}

export async function invalidateProposalCountCache(userId: string) {
  await redis.del(`proposals:pending:count:${userId}`);
}
