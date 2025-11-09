import { NextRequest, NextResponse } from "next/server";
import { CanvasApiClient } from "@/lib/canvas/client";

// GET /api/canvas/assignment-groups/[courseId]
// Fetches assignment groups for a specific course
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

    // Create Canvas API client
    const client = new CanvasApiClient(baseUrl, token);
    
    // Fetch assignment groups
    const assignmentGroups = await client.getAssignmentGroups(parseInt(courseId));

    return NextResponse.json({ assignmentGroups });
  } catch (error) {
    console.error("Assignment groups fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch assignment groups" },
      { status: 500 }
    );
  }
}
