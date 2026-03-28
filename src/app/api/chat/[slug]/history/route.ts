import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { chatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — load chat history for an agent
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { slug } = await params;

  const rows = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.userId, user.sub), eq(chatMessages.agentSlug, slug)))
    .orderBy(asc(chatMessages.createdAt));

  // Return as UIMessage-compatible array
  const messages = rows.map((row) => ({
    id: row.id,
    role: row.role,
    parts: row.parts,
    createdAt: row.createdAt,
  }));

  return NextResponse.json(messages);
}

// POST — save new messages to history
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { slug } = await params;

  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  // Insert each message
  const values = messages.map((msg: { id?: string; role: string; parts: unknown }) => ({
    userId: user.sub,
    agentSlug: slug,
    role: msg.role,
    parts: msg.parts,
  }));

  await db.insert(chatMessages).values(values);

  return NextResponse.json({ saved: values.length });
}

// DELETE — clear chat history
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { slug } = await params;

  await db
    .delete(chatMessages)
    .where(and(eq(chatMessages.userId, user.sub), eq(chatMessages.agentSlug, slug)));

  return NextResponse.json({ cleared: true });
}
