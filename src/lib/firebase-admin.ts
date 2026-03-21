import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "@/lib/db/client";
import { deviceTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Initialize Firebase Admin SDK (uses GOOGLE_APPLICATION_CREDENTIALS or env vars)
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // Graceful fallback — FCM won't work but the app won't crash
    console.warn("Firebase Admin SDK not configured — push notifications disabled");
  }
}

export async function sendCibaNotification(
  userId: string,
  cibaId: string,
  agentName: string,
  action: string,
  service: string
) {
  if (!getApps().length) return;

  const tokens = await db
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.userId, userId));

  if (tokens.length === 0) return;

  const messaging = getMessaging();

  const payload = {
    notification: {
      title: `${agentName} needs approval`,
      body: `${action} on ${service}`,
    },
    data: {
      type: "ciba_request",
      cibaId,
      agentName,
      action,
      service,
    },
  };

  const results = await Promise.allSettled(
    tokens.map((t) =>
      messaging.send({ ...payload, token: t.token })
    )
  );

  // Log failures but don't throw
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`FCM send failed for token ${tokens[i].id}:`, r.reason);
    }
  });
}
