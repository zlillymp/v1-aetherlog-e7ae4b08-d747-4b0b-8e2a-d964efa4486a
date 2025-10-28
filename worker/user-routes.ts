import { Hono } from "hono";
import type { Env } from './core-utils';
import { ContactEntity, CallRecordEntity, UserEntity } from "./entities";
import { ok, bad, isStr, notFound } from './core-utils';
import type { Contact, CallRecord, User, JWTPayload } from "@shared/types";
import { generateJwt, rateLimiter, authMiddleware, adminOnlyMiddleware } from './security';
// --- Self-Contained UUID Generator ---
function simpleUUID(): string {
  return crypto.randomUUID();
}
// --- Crypto Helpers for Password Hashing ---
const textEncoder = new TextEncoder();
async function hashPassword(password: string): Promise<string> {
  const data = textEncoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
// --- Password Policy ---
function isPasswordStrong(password: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}
// Helper to normalize phone numbers to be used as IDs
const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
export function userRoutes(app: Hono<{ Bindings: Env, Variables: { user: JWTPayload } }>) {
  // --- Auth Routes (Rate Limited) ---
  const authRoutes = new Hono<{ Bindings: Env }>();
  authRoutes.use('*', rateLimiter());
  authRoutes.post('/signup', async (c) => {
    const body = await c.req.json<{ name: string; email: string; password: string }>();
    if (!isStr(body.name) || !isStr(body.email) || !isStr(body.password)) {
      return bad(c, 'Name, email, and password are required.');
    }
    if (!isPasswordStrong(body.password)) {
      return bad(c, 'Password does not meet security requirements.');
    }
    const email = body.email.toLowerCase().trim();
    const userEntity = new UserEntity(c.env, email);
    if (await userEntity.exists()) {
      return bad(c, 'A user with this email already exists.');
    }
    const { items: allUsers } = await UserEntity.list(c.env);
    let role: 'admin' | 'user' = 'user';
    if (allUsers.length === 0 && email === 'matt.lilly@example.com') {
      role = 'admin';
    }
    const passwordHash = await hashPassword(body.password);
    const newUser: User = { id: email, email, name: body.name.trim(), passwordHash, role };
    await UserEntity.create(c.env, newUser);
    const { passwordHash: _, ...userToReturn } = newUser;
    return ok(c, userToReturn);
  });
  authRoutes.post('/login', async (c) => {
    const body = await c.req.json<{ email: string; password: string }>();
    if (!isStr(body.email) || !isStr(body.password)) {
      return bad(c, 'Email and password are required.');
    }
    const email = body.email.toLowerCase().trim();
    const userEntity = new UserEntity(c.env, email);
    if (!(await userEntity.exists())) {
      return notFound(c, 'Invalid credentials.');
    }
    const user = await userEntity.getState();
    if (!user.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
      return notFound(c, 'Invalid credentials.');
    }
    const token = await generateJwt({ userId: user.id, role: user.role || 'user' });
    const { passwordHash: _, ...userToReturn } = user;
    return ok(c, { token, user: userToReturn });
  });
  app.route('/api/auth', authRoutes);
  // --- Protected Routes ---
  const protectedRoutes = new Hono<{ Bindings: Env, Variables: { user: JWTPayload } }>();
  protectedRoutes.use('*', authMiddleware());
  // --- Admin Routes ---
  protectedRoutes.get('/admin/users', adminOnlyMiddleware(), async (c) => {
    const { items } = await UserEntity.list(c.env);
    const safeUsers = items.map(({ passwordHash, ...user }) => user);
    return ok(c, safeUsers);
  });
  protectedRoutes.post('/admin/users/update-role', adminOnlyMiddleware(), async (c) => {
    const { userId, role } = await c.req.json<{ userId: string; role: 'admin' | 'user' }>();
    if (!isStr(userId) || !['admin', 'user'].includes(role)) {
      return bad(c, 'Invalid userId or role provided.');
    }
    const adminUser = c.get('user');
    if (adminUser.userId === userId && role === 'user') {
      const { items: allUsers } = await UserEntity.list(c.env);
      const adminCount = allUsers.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return bad(c, 'Cannot remove the last administrator.');
      }
    }
    const userEntity = new UserEntity(c.env, userId);
    if (!(await userEntity.exists())) {
      return notFound(c, 'User not found.');
    }
    await userEntity.patch({ role });
    const updatedUser = await userEntity.getState();
    const { passwordHash, ...safeUser } = updatedUser;
    return ok(c, safeUser);
  });
  protectedRoutes.delete('/admin/users/:userId', adminOnlyMiddleware(), async (c) => {
    const { userId } = c.req.param();
    if (!isStr(userId)) return bad(c, 'Invalid userId.');
    const adminUser = c.get('user');
    if (adminUser.userId === userId) {
      return bad(c, 'Administrators cannot delete their own account.');
    }
    const deleted = await UserEntity.delete(c.env, userId);
    if (!deleted) {
      return notFound(c, 'User not found or already deleted.');
    }
    return ok(c, { id: userId });
  });
  // --- AetherLog Routes (User-Specific) ---
  protectedRoutes.get('/contacts', async (c) => {
    const { userId } = c.get('user');
    const { items: allContacts } = await ContactEntity.list(c.env);
    const userContacts = allContacts.filter(contact => contact.userId === userId);
    return ok(c, userContacts);
  });
  protectedRoutes.get('/contacts/:contactId/calls', async (c) => {
    const { contactId } = c.req.param();
    const { userId } = c.get('user');
    if (!isStr(contactId)) return bad(c, 'Invalid contactId');
    const { items: allCalls } = await CallRecordEntity.list(c.env);
    const items = allCalls.filter((call) => call.contactId === contactId && call.userId === userId);
    return ok(c, items);
  });
  protectedRoutes.post('/calls/upload', async (c) => {
    const { userId } = c.get('user');
    const body = await c.req.json<{ name: string; phone: string; direction: 'inbound' | 'outbound'; timestamp: string; }>();
    if (!isStr(body.name) || !isStr(body.phone) || !isStr(body.direction) || !isStr(body.timestamp)) {
      return bad(c, 'Invalid payload. name, phone, direction, and timestamp are required.');
    }
    const contactId = normalizePhone(body.phone);
    const contactEntity = new ContactEntity(c.env, contactId);
    let contact: Contact;
    if (await contactEntity.exists()) {
      contact = await contactEntity.getState();
      if (contact.userId !== userId) {
        await contactEntity.patch({ name: body.name, userId: userId });
        contact.name = body.name;
        contact.userId = userId;
      }
    } else {
      const initials = body.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
      contact = {
        id: contactId,
        name: body.name,
        phone: body.phone,
        initials,
        userId: userId,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=random`,
      };
      await ContactEntity.create(c.env, contact);
    }
    const callRecord: CallRecord = {
      id: simpleUUID(),
      contactId: contact.id,
      direction: body.direction,
      timestamp: body.timestamp,
      userId: userId,
    };
    await CallRecordEntity.create(c.env, callRecord);
    return ok(c, { contact, callRecord });
  });
  app.route('/api', protectedRoutes);
}