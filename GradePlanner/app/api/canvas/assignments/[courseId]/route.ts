import { NextRequest, NextResponse } from "next/server";
import { CanvasApiClient } from "@/lib/canvas/client";
import { mapAssignmentGroup } from "@/lib/canvas/mapper";

// GET /api/canvas/assignments/[courseId]
// Fetches assignment groups and assignments for a specific course
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

    // Fetch assignment groups (includes assignments)
    const assignmentGroups = await client.getAssignmentGroups(
      parseInt(courseId)
    );

    // Map to app format
    const categories = assignmentGroups.map((group) =>
      mapAssignmentGroup(group, courseId)
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Assignments fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch assignments",
      },
      { status: 500 }
    );
  }
}
