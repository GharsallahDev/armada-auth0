import { getAuthenticatedUser } from "@/lib/auth";
import { getMyAccountToken } from "@/lib/token-vault";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const domain = process.env.AUTH0_DOMAIN!;
    const token = await getMyAccountToken();

    const res = await fetch(
      `https://${domain}/me/v1/connected-accounts/accounts/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Disconnect account failed:", data);
      return NextResponse.json(
        {
          error:
            data.error_description ||
            data.error ||
            "Failed to disconnect account",
        },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect account",
      },
      { status: 500 }
    );
  }
}
