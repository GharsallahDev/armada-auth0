import { getAuthenticatedUser } from "@/lib/auth";
import { getMyAccountToken } from "@/lib/token-vault";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const DEFAULT_SCOPES: Record<string, string[]> = {
  "google-oauth2": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/tasks",
  ],
  github: ["read:user", "repo", "read:org"],
  discord: ["identify", "guilds", "guilds.members.read"],
  "sign-in-with-slack": [
    "users:read",
    "channels:read",
    "channels:history",
    "chat:write",
  ],
  linkedin: ["openid", "profile", "email", "w_member_social"],
  shopify: ["read_products", "read_orders"],
  stripe: ["read_write"],
  spotify: [
    "user-read-private",
    "playlist-read-private",
    "playlist-modify-public",
  ],
  facebook: ["email", "public_profile", "pages_show_list"],
  twitter: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  twitch: ["user:read:email", "channel:read:subscriptions"],
};

function getBaseUrl() {
  if (process.env.APP_BASE_URL && process.env.APP_BASE_URL !== "http://localhost:3000") {
    return process.env.APP_BASE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

async function initiateConnect(connection: string, additionalScopes?: string[]) {
  const domain = process.env.AUTH0_DOMAIN!;
  const baseUrl = getBaseUrl();
  const token = await getMyAccountToken();

  const defaultScopes = DEFAULT_SCOPES[connection] || [];
  const mergedScopes = Array.from(
    new Set([...defaultScopes, ...(additionalScopes || [])])
  );

  const state = crypto.randomUUID();

  const res = await fetch(
    `https://${domain}/me/v1/connected-accounts/connect`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        connection,
        redirect_uri: `${baseUrl}/dashboard/connect/callback`,
        state,
        scopes: mergedScopes,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Connected Accounts connect failed:", data);
    throw new Error(
      `Auth0 Connected Accounts error (${res.status}): ${JSON.stringify(data)}`
    );
  }

  // Build the full redirect URL with ticket from connect_params
  let connectUrl = data.connect_uri;
  if (data.connect_params?.ticket) {
    const separator = connectUrl.includes("?") ? "&" : "?";
    connectUrl = `${connectUrl}${separator}ticket=${data.connect_params.ticket}`;
  }

  return {
    connect_uri: connectUrl,
    auth_session: data.auth_session,
    connection,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connection, scopes } = body as {
      connection: string;
      scopes?: string[];
    };

    if (!connection) {
      return NextResponse.json(
        { error: "connection is required" },
        { status: 400 }
      );
    }

    const result = await initiateConnect(connection, scopes);

    const cookieStore = await cookies();
    cookieStore.set("auth0_connect_session", result.auth_session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return NextResponse.json({ connect_uri: result.connect_uri });
  } catch (error) {
    console.error("Connect initiation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to initiate connect",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const connection = req.nextUrl.searchParams.get("connection");
    if (!connection) {
      return NextResponse.json(
        { error: "connection query param is required" },
        { status: 400 }
      );
    }

    const scopesParam = req.nextUrl.searchParams.get("scopes");
    const additionalScopes = scopesParam ? scopesParam.split(",") : undefined;

    const result = await initiateConnect(connection, additionalScopes);

    const cookieStore = await cookies();
    cookieStore.set("auth0_connect_session", result.auth_session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return NextResponse.redirect(result.connect_uri);
  } catch (error: any) {
    console.error("Connect redirect error:", error);
    const url = new URL("/dashboard/settings", req.url);
    url.searchParams.set("error", "connect_failed");
    url.searchParams.set("detail", error.message?.slice(0, 200) || "Unknown error");
    return NextResponse.redirect(url);
  }
}
