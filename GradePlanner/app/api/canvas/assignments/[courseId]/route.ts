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

    // 🔍 DEBUG: Canvas API 원본 응답 로깅
    console.log("\n" + "🔍 CANVAS API RAW RESPONSE ".padEnd(60, "="));
    console.log(`Course ID: ${courseId}`);
    assignmentGroups.forEach((group) => {
      console.log(`\n📁 Group: ${group.name}`);
      group.assignments?.forEach((assignment) => {
        if (
          assignment.name.toLowerCase().includes("quiz") ||
          assignment.name.toLowerCase().includes("lab")
        ) {
          console.log(`\n  📝 ${assignment.name}`);
          console.log(`     Points: ${assignment.points_possible}`);
          console.log(
            `     Submission:`,
            JSON.stringify(assignment.submission, null, 6)
          );
        }
      });
    });
    console.log("=".repeat(60) + "\n");

    // Map to app format
    const categories = assignmentGroups.map((group) =>
      mapAssignmentGroup(group, courseId)
    );

    // 🔍 DEBUG: 매핑 후 최종 데이터 로깅
    console.log("\n" + "✅ AFTER MAPPING ".padEnd(60, "="));
    categories.forEach((category) => {
      const quizOrLab = category.assignments.filter(
        (a) =>
          a.name.toLowerCase().includes("quiz") ||
          a.name.toLowerCase().includes("lab")
      );
      if (quizOrLab.length > 0) {
        console.log(`\n📁 ${category.name}:`);
        quizOrLab.forEach((a) => {
          console.log(`  📝 ${a.name}`);
          console.log(`     Points: ${a.points}, Earned: ${a.earned}`);
          console.log(`     Submitted: ${a.submitted}, Graded: ${a.graded}`);
          console.log(`     Missing: ${a.missing}, Excused: ${a.excused}`);
        });
      }
    });
    console.log("=".repeat(60) + "\n");

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
