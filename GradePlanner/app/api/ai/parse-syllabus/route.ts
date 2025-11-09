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

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: "PDF appears to be empty or unreadable" },
        { status: 400 }
      );
    }

    console.log(`📄 PDF extracted: ${pdfText.length} characters`);

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    if (!process.env.CLAUDE_API_KEY) {
      console.error("❌ CLAUDE_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service not configured. Please set CLAUDE_API_KEY." },
        { status: 500 }
      );
    }

    console.log("🚀 Starting Claude API call with Sonnet 4.5...");

    // Parse with Claude API (Updated to Sonnet 4.5)
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      temperature: 0.3, // Use temperature OR top_p, not both (breaking change in Claude 4)
      messages: [
        {
          role: "user",
          content: `Extract grading categories from this syllabus and return ONLY a JSON object.

REQUIRED FORMAT:
{
  "categories": [
    {"name": "Exams", "weight": 40, "count": 3},
    {"name": "Homework", "weight": 30, "count": 10}
  ]
}

EXTRACTION RULES:
1. Find ALL grading categories (Exams, Homework, Quizzes, Projects, Participation, etc.)
2. Extract weight as percentage (0-100). Use null if not specified.
3. Extract count of items. Use 1 if not specified.
4. Combine similar items (e.g., "Midterm 1" + "Midterm 2" → "Exams" with count 2)
5. Return ONLY the JSON object, no markdown formatting, no explanations.

COMMON PATTERNS TO LOOK FOR:
- "Exams: 40%" or "Exams (40%)"
- "3 exams worth 40% of final grade"
- "Weekly homework: 30%"
- "Final exam: 25%"
- "Midterm 1 and Midterm 2: 15% each" → combine as "Exams: 30%, count: 2"

SYLLABUS TEXT:
${pdfText}

Return the JSON object now:`,
        },
      ],
    });

    // Extract JSON from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log(
      `🤖 Claude Sonnet 4.5 response: ${responseText.substring(0, 200)}...`
    );
    console.log(`📊 Stop reason: ${message.stop_reason}`);

    // Handle refusal stop reason (new in Claude 4)
    // Note: TypeScript types may not be updated yet, but this is a valid stop_reason in Claude 4
    if (message.stop_reason === ("refusal" as any)) {
      console.error("❌ Claude refused to process the request");
      return NextResponse.json(
        {
          error:
            "AI refused to process this syllabus. Please try a different file or enter manually.",
        },
        { status: 422 }
      );
    }

    // Handle context window exceeded (Sonnet 4.5 specific)
    if (message.stop_reason === ("model_context_window_exceeded" as any)) {
      console.error("❌ PDF is too large for Claude to process");
      return NextResponse.json(
        {
          error:
            "PDF is too large. Please try a shorter syllabus or enter manually.",
        },
        { status: 413 }
      );
    }

    // Try to parse JSON from response
    // Remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "");
    }

    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Failed to extract JSON from response:", responseText);
      return NextResponse.json(
        {
          error:
            "AI could not parse syllabus format. Please try a different file or enter manually.",
          rawResponse: responseText.substring(0, 500),
        },
        { status: 422 }
      );
    }

    const syllabusData = JSON.parse(jsonMatch[0]);

    // Validate parsed data
    if (!syllabusData.categories || !Array.isArray(syllabusData.categories)) {
      console.error("❌ Invalid categories format:", syllabusData);
      return NextResponse.json(
        { error: "Invalid syllabus data format" },
        { status: 422 }
      );
    }

    console.log(
      `✅ Successfully parsed ${syllabusData.categories.length} categories`
    );

    return NextResponse.json({
      success: true,
      data: syllabusData,
      rawText: pdfText.substring(0, 500), // First 500 chars for reference
    });
  } catch (error) {
    console.error("Syllabus parsing error:", error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI API key is invalid or missing" },
          { status: 500 }
        );
      }
      if (error.message.includes("PDF")) {
        return NextResponse.json(
          { error: "Failed to read PDF file. Please ensure it's a valid PDF." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to parse syllabus",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
