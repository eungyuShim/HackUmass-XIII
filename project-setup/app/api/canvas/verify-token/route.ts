import { NextRequest, NextResponse } from "next/server";

// POST /api/canvas/verify-token
// Verifies Canvas Personal Access Token
export async function POST(request: NextRequest) {
  try {
    const { token, baseUrl } = await request.json();

    if (!token || !baseUrl) {
      return NextResponse.json(
        { error: "Token and baseUrl are required" },
        { status: 400 }
      );
    }

    // Call Canvas API to verify token
    const response = await fetch(`${baseUrl}/api/v1/users/self`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Invalid token or base URL" },
        { status: 401 }
      );
    }

    const user = await response.json();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
