import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('aetherlog_token');
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, { ...init, headers });
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success) {
    const errorMessage = json.success === false ? json.error : 'Request failed with status ' + res.status;
    throw new Error(errorMessage);
  }
  return json.data
}