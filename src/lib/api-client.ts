const DEV_DEFAULT = "http://localhost:8000/api/v1";
/** Production build default: same origin + reverse proxy (e.g. nginx → Laravel). */
const PROD_DEFAULT = "/api/v1";

const AUTH_TOKEN_KEY = "gilitour_auth_token";

function resolveApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return import.meta.env.DEV ? DEV_DEFAULT : PROD_DEFAULT;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function clearAuthSession(): void {
  setAuthToken(null);
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("userRole");
  }
}

function authHeaders(): HeadersInit {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestInit = RequestInit & { skipAuth?: boolean };

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const firstFieldError = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined;
  const message =
    payload?.message ?? firstFieldError ?? `Request failed with status ${response.status}`;

  return new ApiError(message, response.status, payload?.errors ?? undefined);
}

async function apiRequest<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const { skipAuth, ...rest } = init ?? {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(skipAuth ? {} : authHeaders()),
      ...rest.headers,
    },
  });

  if (response.status === 401 && !skipAuth) {
    clearAuthSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
    throw await parseErrorResponse(response);
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string, init?: ApiRequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, method: "GET" });
}

export async function apiPatch<T>(path: string, body: unknown, init?: ApiRequestInit): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function apiPost<T>(path: string, body: unknown, init?: ApiRequestInit): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
