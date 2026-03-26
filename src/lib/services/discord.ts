import { getServiceToken } from "@/lib/token-vault";

async function getDiscordToken(): Promise<string> {
  return getServiceToken("discord");
}

async function discordApi(token: string, endpoint: string, options?: RequestInit) {
  const res = await fetch(`https://discord.com/api/v10${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Discord API error: ${res.status} ${error}`);
  }
  return res.json();
}

export async function listServers(userId: string) {
  const token = await getDiscordToken();
  const guilds = await discordApi(token, "/users/@me/guilds");
  return guilds.map((g: any) => ({
    id: g.id,
    name: g.name,
    icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
    memberCount: g.approximate_member_count,
  }));
}

export async function listChannels(userId: string, serverId: string) {
  const token = await getDiscordToken();
  const channels = await discordApi(token, `/guilds/${serverId}/channels`);
  return channels
    .filter((c: any) => c.type === 0) // text channels only
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic || "",
    }));
}

export async function readMessages(userId: string, channelId: string, limit = 20) {
  const token = await getDiscordToken();
  const messages = await discordApi(token, `/channels/${channelId}/messages?limit=${limit}`);
  return messages.map((m: any) => ({
    id: m.id,
    author: m.author?.username || "unknown",
    content: m.content?.substring(0, 500) || "",
    timestamp: m.timestamp,
  }));
}

export async function sendMessage(userId: string, channelId: string, content: string) {
  const token = await getDiscordToken();
  const message = await discordApi(token, `/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return {
    id: message.id,
    content: message.content,
    status: "sent",
  };
}
