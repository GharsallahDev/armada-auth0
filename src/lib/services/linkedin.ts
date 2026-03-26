import { getServiceToken } from "@/lib/token-vault";

async function getLinkedinToken(): Promise<string> {
  return getServiceToken("linkedin");
}

async function linkedinApi(token: string, url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function getProfile(userId: string) {
  const token = await getLinkedinToken();
  const profile = await linkedinApi(token, "https://api.linkedin.com/v2/userinfo");
  return {
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
    sub: profile.sub,
  };
}

export async function createPost(userId: string, text: string) {
  const token = await getLinkedinToken();
  const profile = await linkedinApi(token, "https://api.linkedin.com/v2/userinfo");
  const personId = profile.sub;

  const post = await linkedinApi(token, "https://api.linkedin.com/rest/posts", {
    method: "POST",
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      commentary: text,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
    }),
  });
  return { status: "posted", id: post["x-restli-id"] || "created", message: `Post created on LinkedIn: "${text.substring(0, 100)}..."` };
}

export async function getConnections(userId: string, limit = 10) {
  const token = await getLinkedinToken();
  // LinkedIn v2 API doesn't expose connections list directly
  // Return profile info instead
  const profile = await linkedinApi(token, "https://api.linkedin.com/v2/userinfo");
  return { profile, note: "LinkedIn API v2 restricts direct connections access. Profile retrieved instead." };
}
