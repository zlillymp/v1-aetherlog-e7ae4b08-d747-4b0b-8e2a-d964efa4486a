export type CallDirection = 'inbound' | 'outbound';
export interface Contact {
  id: string; // Based on normalized phone number
  name: string;
  phone: string;
  initials: string;
  userId: string;
  avatarUrl?: string;
  calls?: CallRecord[];
}
export interface CallRecord {
  id: string; // UUID
  contactId: string; // Corresponds to Contact's ID
  direction: CallDirection;
  timestamp: string; // ISO 8601 format
  userId: string;
}
export interface User {
  id: string; // email
  email: string;
  name: string;
  passwordHash?: string; // Should not be sent to client
  role?: 'admin' | 'user';
}
export interface JWTPayload {
  userId: string;
  role: 'admin' | 'user';
  exp: number; // Expiration time (Unix timestamp)
  [key: string]: any; // Index signature for hono/jwt compatibility
}
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };