export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...options?.headers },
    credentials: 'same-origin',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/admin/') && path !== '/admin/login' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nucleus:session-expired'));
    }
    throw new ApiError(data.error || 'The connection was interrupted. Please try again.', response.status);
  }
  return data as T;
}
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}
