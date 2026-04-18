import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parser";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "text/plain";

    const data = await parseResume(buffer, mimeType, file.name);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Parse resume error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse resume" }, { status: 500 });
  }
}
