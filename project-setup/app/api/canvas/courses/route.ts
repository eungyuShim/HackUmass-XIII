import { NextRequest, NextResponse } from "next/server";

// GET /api/canvas/courses
// Fetches list of active courses from Canvas
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-canvas-token");
    const baseUrl = request.headers.get("x-canvas-base-url");

    if (!token || !baseUrl) {
      return NextResponse.json(
        { error: "Token and baseUrl are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: response.status }
      );
    }

    const courses = await response.json();

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
