const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  DEFAULT_API_BASE_URL;

interface ApiErrorPayload {
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiGet<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiGet<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
