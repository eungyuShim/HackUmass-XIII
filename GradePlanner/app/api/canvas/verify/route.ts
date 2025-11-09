import { NextRequest, NextResponse } from "next/server";
import { CanvasApiClient } from "@/lib/canvas/client";

// POST /api/canvas/verify
// Verify Canvas token and URL validity

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUrl, token } = body;

    if (!baseUrl || !token) {
      return NextResponse.json(
        { error: "Base URL and token are required" },
        { status: 400 }
      );
    }

    // Create client and verify token
    const client = new CanvasApiClient(baseUrl, token);
    const isValid = await client.verifyToken();

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Canvas credentials" },
        { status: 401 }
      );
    }

    // Get user profile to return user info
    const user = await client.getCurrentUser();

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Canvas verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
