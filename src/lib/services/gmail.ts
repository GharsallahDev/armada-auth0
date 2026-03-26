import { getGoogleAccessToken, googleApi } from "./google-auth";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listEmails(userId: string, maxResults = 10) {
  const token = await getToken();
  const list = await googleApi(token, `${GMAIL_BASE}/messages?maxResults=${maxResults}&labelIds=INBOX`);

  if (!list.messages || list.messages.length === 0) {
    return [];
  }

  const emails = await Promise.all(
    list.messages.slice(0, maxResults).map(async (msg: { id: string }) => {
      const detail = await googleApi(token, `${GMAIL_BASE}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
      const headers = detail.payload?.headers || [];
      const get = (name: string) => headers.find((h: { name: string; value: string }) => h.name === name)?.value || "";
      return {
        id: detail.id,
        threadId: detail.threadId,
        from: get("From"),
        subject: get("Subject"),
        date: get("Date"),
        snippet: detail.snippet?.substring(0, 200) || "",
        unread: (detail.labelIds || []).includes("UNREAD"),
      };
    })
  );

  return emails;
}

export async function readEmail(userId: string, messageId: string) {
  const token = await getToken();
  const detail = await googleApi(token, `${GMAIL_BASE}/messages/${messageId}?format=full`);
  const headers = detail.payload?.headers || [];
  const get = (name: string) => headers.find((h: { name: string; value: string }) => h.name === name)?.value || "";

  // Extract body text
  let body = "";
  if (detail.payload?.body?.data) {
    body = Buffer.from(detail.payload.body.data, "base64url").toString("utf-8");
  } else if (detail.payload?.parts) {
    const textPart = detail.payload.parts.find((p: { mimeType: string }) => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64url").toString("utf-8");
    }
  }

  return {
    id: detail.id,
    from: get("From"),
    to: get("To"),
    subject: get("Subject"),
    date: get("Date"),
    body: body.substring(0, 2000),
  };
}

export async function draftEmail(
  userId: string,
  to: string,
  subject: string,
  body: string
) {
  const token = await getToken();
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");

  const draft = await googleApi(token, `${GMAIL_BASE}/drafts`, {
    method: "POST",
    body: JSON.stringify({ message: { raw } }),
  });

  return {
    id: draft.id,
    to,
    subject,
    status: "draft_created",
    message: `Draft email to ${to} created successfully. Subject: "${subject}"`,
  };
}

export async function sendEmail(
  userId: string,
  to: string,
  subject: string,
  body: string
) {
  const token = await getToken();
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");

  const sent = await googleApi(token, `${GMAIL_BASE}/messages/send`, {
    method: "POST",
    body: JSON.stringify({ raw }),
  });

  return {
    id: sent.id,
    to,
    subject,
    status: "sent",
    message: `Email sent to ${to}. Subject: "${subject}"`,
  };
}
