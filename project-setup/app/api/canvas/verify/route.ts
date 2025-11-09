import { NextRequest, NextResponse } from "next/server";

// TODO: Verify Canvas token and URL
// GET /api/canvas/verify

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Token verification endpoint" });
}
