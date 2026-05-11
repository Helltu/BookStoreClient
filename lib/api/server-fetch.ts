import { cookies } from "next/headers";

export async function serverFetch(url: string, init?: RequestInit): Promise<Response> {
  const store = await cookies();
  const token = store.get("token")?.value;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
