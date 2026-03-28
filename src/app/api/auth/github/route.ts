import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/github/callback`;
  const scopes = "repo read:user read:org";
  const state = Buffer.from(JSON.stringify({ userId: session.user.sub })).toString("base64url");

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

  return NextResponse.redirect(url);
}
