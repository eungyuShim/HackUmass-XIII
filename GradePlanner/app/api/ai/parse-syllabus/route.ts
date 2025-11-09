import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import pdf from "pdf-parse";

// POST /api/ai/parse-syllabus
// Parses PDF syllabus using Claude API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const data = await pdf(buffer);
    const pdfText = data.text;

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Parse with Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `다음 syllabus PDF에서 아래 정보를 추출하여 JSON 형식으로 반환하세요:

1. 성적 카테고리 (Exams, Assignments, Quizzes, Attendance 등)
2. 각 카테고리의 가중치 (%)
3. 각 카테고리에 포함된 항목 개수

반드시 다음 JSON 형식을 따라야 하며, 추출할 수 없는 정보는 null로 표시하세요:

{
  "categories": [
    {
      "name": "Exams",
      "weight": 30,
      "count": 3
    }
  ]
}

Syllabus 내용:
${pdfText}`,
        },
      ],
    });

    // Extract JSON from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Claude response");
    }

    const syllabusData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: syllabusData,
      rawText: pdfText.substring(0, 500), // First 500 chars for reference
    });
  } catch (error) {
    console.error("Syllabus parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse syllabus" },
      { status: 500 }
    );
  }
}
