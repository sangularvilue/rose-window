import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ROOM_TTL = 60 * 60 * 24; // 24 hours

export function roomKey(roomId: string) {
  return `rosewindow:room:${roomId}`;
}
