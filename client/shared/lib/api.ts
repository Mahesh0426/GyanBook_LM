export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * A function is used to make API requests and handle errors in a consistent way. It automatically sets the Content-Type header for JSON requests, includes credentials, and parses the response. If the response is not ok, it throws an ApiError with the status code, message, and any additional details provided by the server.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data as { error?: string } | null)?.error ?? "Request failed",
      (data as { details?: unknown } | null)?.details,
    );
  }

  return data as T;
}
