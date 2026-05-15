const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors?: { field: string; message: string }[]
  ) {
    super(message);
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // Only run in browser
  if (typeof window === 'undefined') return false;
  // Dynamically import to avoid server-side issues
  const { getRefreshToken, setToken, setRefreshToken, removeToken } = await import('./auth');

  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      removeToken();
      return false;
    }

    const data = await res.json();
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function attemptRefresh(): Promise<boolean> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = tryRefreshToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
    return refreshPromise;
  }
  // Wait for existing refresh to complete
  return refreshPromise ?? false;
}

async function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const { isAuthenticated, removeToken } = await import('./auth');
  removeToken();
  window.location.href = '/admin/login';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (fetchOptions.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // Auto-refresh on 401
  if (response.status === 401 && token) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      // Retry with new token
      const { getToken } = await import('./auth');
      const newToken = getToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE}${path}`, {
          ...fetchOptions,
          headers,
        });
      }
    } else {
      redirectToLogin();
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Session expired. Redirecting to login...');
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body.code || 'UNKNOWN_ERROR',
      body.detail || body.message || 'Request failed',
      body.errors
    );
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      token,
    }),

  put: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      token,
    }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),

  upload: <T>(path: string, formData: FormData, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
      token,
    }),
};

export { ApiError };
export default apiClient;
