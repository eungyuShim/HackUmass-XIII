import { NextRequest, NextResponse } from "next/server";

// GET /api/canvas/assignments/[courseId]
// Fetches assignments for a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const token = request.headers.get("x-canvas-token");
    const baseUrl = request.headers.get("x-canvas-base-url");

    if (!token || !baseUrl) {
      return NextResponse.json(
        { error: "Token and baseUrl are required" },
        { status: 400 }
      );
    }

    const { courseId } = params;

    const response = await fetch(
      `${baseUrl}/api/v1/courses/${courseId}/assignments?include[]=submission&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: response.status }
      );
    }

    const assignments = await response.json();

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Assignments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
