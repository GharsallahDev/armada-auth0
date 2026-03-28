import { getServiceToken } from "@/lib/token-vault";

async function getSlackToken(): Promise<string> {
  try {
    return await getServiceToken("slack");
  } catch {
    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) throw new Error("Slack not connected. Please connect Slack in Settings.");
    return botToken;
  }
}

async function slackApi(method: string, body?: Record<string, unknown>) {
  const token = await getSlackToken();
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack API error (${method}): ${data.error}`);
  return data;
}

export async function listChannels(limit = 20) {
  const data = await slackApi("conversations.list", {
    types: "public_channel",
    limit,
    exclude_archived: true,
  });
  return data.channels.map((ch: { id: string; name: string; topic?: { value: string }; num_members: number }) => ({
    id: ch.id,
    name: ch.name,
    topic: ch.topic?.value || "",
    memberCount: ch.num_members,
  }));
}

export async function joinChannel(channelId: string) {
  try {
    await slackApi("conversations.join", { channel: channelId });
  } catch {
    // Already in channel or can't join — continue anyway
  }
}

export async function readMessages(channelId: string, limit = 10) {
  await joinChannel(channelId);
  const data = await slackApi("conversations.history", {
    channel: channelId,
    limit,
  });
  const messages = [];
  for (const msg of data.messages || []) {
    let username = msg.user || "unknown";
    try {
      const userInfo = await slackApi("users.info", { user: msg.user });
      username = userInfo.user?.real_name || userInfo.user?.name || msg.user;
    } catch {
      // keep user ID as fallback
    }
    messages.push({
      user: username,
      text: msg.text?.substring(0, 500) || "",
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
    });
  }
  return messages;
}

export async function sendMessage(channelId: string, text: string) {
  const data = await slackApi("chat.postMessage", {
    channel: channelId,
    text,
  });
  return {
    ok: true,
    channel: data.channel,
    timestamp: data.ts,
    message: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
  };
}

export async function searchChannelByName(name: string) {
  const channels = await listChannels(100);
  const match = channels.find(
    (ch: { name: string }) =>
      ch.name.toLowerCase() === name.toLowerCase() ||
      ch.name.toLowerCase().includes(name.toLowerCase())
  );
  return match || null;
}
