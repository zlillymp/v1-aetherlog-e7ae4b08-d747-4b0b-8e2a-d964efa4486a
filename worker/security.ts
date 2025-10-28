import { Hono, Next } from 'hono';
import { sign, verify } from 'hono/jwt';
import { Context } from 'hono';
import { Env, GlobalDurableObject } from './core-utils';
import { JWTPayload } from '@shared/types';
import { bad } from './core-utils';
import { DurableObjectStub } from 'cloudflare:workers';
// IMPORTANT: In a real production environment, this secret should be stored in a secure secret manager (e.g., Cloudflare Secrets)
// and not hardcoded. We are hardcoding it here due to project constraints.
const JWT_SECRET = 'aetherlog-super-secret-key-for-production';
export const generateJwt = async (payload: Omit<JWTPayload, 'exp'>): Promise<string> => {
  const finalPayload: JWTPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24-hour expiration
  };
  return sign(finalPayload, JWT_SECRET);
};
export const verifyJwt = async (token: string): Promise<JWTPayload | null> => {
  try {
    const payload = await verify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (e) {
    return null;
  }
};
// --- Rate Limiting Middleware ---
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP
export const rateLimiter = () => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `rate-limit:${ip}`;
    const doId = c.env.GlobalDurableObject.idFromName('rate-limiter');
    const stub: DurableObjectStub<GlobalDurableObject> = c.env.GlobalDurableObject.get(doId);
    const stored = await stub.getDoc<{ count: number; timestamp: number }>(key);
    const now = Date.now();
    let count = 1;
    let timestamp = now;
    if (stored) {
      const isWithinWindow = (now - stored.data.timestamp) < RATE_LIMIT_WINDOW_MS;
      if (isWithinWindow) {
        if (stored.data.count >= RATE_LIMIT_MAX_REQUESTS) {
          return c.json({ success: false, error: 'Too many requests. Please try again later.' }, 429);
        }
        count = stored.data.count + 1;
        timestamp = stored.data.timestamp;
      }
    }
    await stub.casPut(key, stored?.v ?? 0, { count, timestamp });
    await next();
  };
};
// --- Auth Middleware ---
export const authMiddleware = () => {
  return async (c: Context<{ Bindings: Env, Variables: { user: JWTPayload } }>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return bad(c, 'Unauthorized: Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyJwt(token);
    if (!payload) {
      return bad(c, 'Unauthorized: Invalid or expired token');
    }
    c.set('user', payload);
    await next();
  };
};
export const adminOnlyMiddleware = () => {
  return async (c: Context<{ Bindings: Env, Variables: { user: JWTPayload } }>, next: Next) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden: Administrator access required' }, 403);
    }
    await next();
  };
};