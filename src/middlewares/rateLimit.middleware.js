import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis, isRedisAvailable } from '../config/redis.js';

function makeStore() {
  if (!isRedisAvailable()) return undefined;

  const redis = getRedis();
  try {
    return new RedisStore({
      sendCommand: async (...args) => {
        if (!isRedisAvailable()) {
          if (args[0] === 'SCRIPT') return 'fallback_sha';
          if (args[0] === 'EVALSHA') return [1, 60000];
          return null;
        }
        return await redis.call(...args);
      },
    });
  } catch {
    return undefined;
  }
}

function createLimiter(options) {
  const store = makeStore();
  return rateLimit({
    ...options,
    ...(store ? { store } : {}),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
  });
}

export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti' },
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit' },
});

export const chatLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terlalu banyak permintaan chat, tunggu sebentar' },
});

export const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terlalu banyak upload, coba lagi dalam 1 jam' },
});
