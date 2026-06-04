import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    // 每个 IP 每分钟最多 10 次请求
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });

  return ratelimit;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; response: NextResponse };

export async function checkRateLimit(
  req: NextRequest,
): Promise<RateLimitResult> {
  const limiter = getRatelimit();
  if (!limiter) return { limited: false };

  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return {
      limited: true,
      response: NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      ),
    };
  }

  return { limited: false };
}
