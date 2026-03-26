import { getServiceToken } from "@/lib/token-vault";

export async function getGoogleAccessToken(): Promise<string> {
  return getServiceToken("google");
}

export async function googleApi(accessToken: string, url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API error (${res.status}): ${err}`);
  }
  return res.json();
}
