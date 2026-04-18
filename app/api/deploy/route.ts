import { NextRequest, NextResponse } from "next/server";
import { deployToGitHub, getGitHubUsername } from "@/lib/github";
import { generatePortfolioHTML } from "@/lib/template";
import { ResumeData } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const githubToken = formData.get("githubToken") as string;
    const repoName = formData.get("repoName") as string;
    const resumeDataStr = formData.get("resumeData") as string;
    const photo = formData.get("photo") as File | null;

    if (!githubToken || !repoName || !resumeDataStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resumeData: ResumeData = JSON.parse(resumeDataStr);
    const username = await getGitHubUsername(githubToken);

    let photoBase64 = "";
    let photoMimeType = "image/jpeg";
    let photoExt = "jpg";

    if (photo) {
      const bytes = await photo.arrayBuffer();
      photoBase64 = Buffer.from(bytes).toString("base64");
      photoMimeType = photo.type || "image/jpeg";
      photoExt = photoMimeType.includes("png") ? "png" : "jpg";
    }

    const html = generatePortfolioHTML(resumeData, photoExt);
    const url = await deployToGitHub(githubToken, username, repoName, html, photoBase64, photoMimeType);

    return NextResponse.json({ success: true, url, username, repoName });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Deploy error:", error);
    return NextResponse.json({ error: error.message || "Deployment failed" }, { status: 500 });
  }
}
