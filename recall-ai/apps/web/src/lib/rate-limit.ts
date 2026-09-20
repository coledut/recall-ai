import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit() {
  if (!ratelimit) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
      });
    }
  }
  return ratelimit;
}

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const limit = getRatelimit();
  if (!limit) return true; // Allow if Redis not configured

  try {
    const result = await limit.limit(identifier);
    return result.success;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Fail open, don't block users
  }
}

// Specific rate limiters
export async function checkAuthRateLimit(email: string): Promise<boolean> {
  const limit = getRatelimit();
  if (!limit) return true;

  try {
    // 5 auth attempts per 15 minutes per email
    const limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
    });
    const result = await limiter.limit(`auth:${email}`);
    return result.success;
  } catch (error) {
    console.error('Auth rate limit check failed:', error);
    return true;
  }
}

export async function checkApiRateLimit(userId: string): Promise<boolean> {
  const limit = getRatelimit();
  if (!limit) return true;

  try {
    // 1000 API calls per hour per user
    const limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(1000, '1 h'),
    });
    const result = await limiter.limit(`api:${userId}`);
    return result.success;
  } catch (error) {
    console.error('API rate limit check failed:', error);
    return true;
  }
}
