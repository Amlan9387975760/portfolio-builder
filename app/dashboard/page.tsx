"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ResumeData } from "@/lib/types";

type Step = "upload" | "review" | "deploy" | "done";

export default function Dashboard() {
  const [step, setStep] = useState<Step>("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [githubToken, setGithubToken] = useState("");
  const [repoName, setRepoName] = useState("my-portfolio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  // Resume dropzone
  const onResumeDrop = useCallback((files: File[]) => {
    if (files[0]) setResumeFile(files[0]);
  }, []);
  const { getRootProps: getResumeProps, getInputProps: getResumeInput, isDragActive: isResumeDrag } = useDropzone({
    onDrop: onResumeDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  // Photo dropzone
  const onPhotoDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setPhotoFile(files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
  }, []);
  const { getRootProps: getPhotoProps, getInputProps: getPhotoInput, isDragActive: isPhotoDrag } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  async function handleParseResume() {
    if (!resumeFile) { setError("Please upload a resume file."); return; }
    setError("");
    setLoading(true);
    setLoadingMsg("AI is reading your resume...");
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResumeData(json.data);
      setStep("review");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to parse resume.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  async function handleDeploy() {
    if (!githubToken) { setError("Please enter your GitHub token."); return; }
    if (!repoName) { setError("Please enter a repository name."); return; }
    setError("");
    setLoading(true);
    setLoadingMsg("Creating GitHub repository...");
    try {
      const fd = new FormData();
      fd.append("githubToken", githubToken);
      fd.append("repoName", repoName);
      fd.append("resumeData", JSON.stringify(resumeData));
      if (photoFile) fd.append("photo", photoFile);

      setLoadingMsg("Generating portfolio & deploying...");
      const res = await fetch("/api/deploy", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDeployedUrl(json.url);
      setStep("done");
    } catch (e: unknown) {
      setError((e as Error).message || "Deployment failed.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  const steps = [
    { id: "upload", label: "Upload", num: 1 },
    { id: "review", label: "Review", num: 2 },
    { id: "deploy", label: "Deploy", num: 3 },
    { id: "done", label: "Done", num: 4 },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f1a" }}>
      {/* Header */}
      <header className="border-b border-[#2d2d4e] px-8 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold" style={{ background: "linear-gradient(90deg,#6c63ff,#ff6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          PortfolioBuilder
        </a>
        <span className="text-xs text-[#94a3b8] bg-[#1a1a2e] px-3 py-1 rounded-full border border-[#2d2d4e]">
          Instant Resume Parser
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="flex items-center mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: i <= currentIdx ? "#6c63ff" : "#2d2d4e",
                    color: i <= currentIdx ? "#fff" : "#94a3b8",
                  }}
                >
                  {i < currentIdx ? "✓" : s.num}
                </div>
                <span className="text-xs mt-1" style={{ color: i <= currentIdx ? "#6c63ff" : "#94a3b8" }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2 mb-5" style={{ background: i < currentIdx ? "#6c63ff" : "#2d2d4e" }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Upload Your Files</h1>
              <p className="text-[#94a3b8] text-sm">Your resume will be parsed by AI to generate your portfolio.</p>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Resume <span className="text-red-400">*</span></label>
              <div
                {...getResumeProps()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: isResumeDrag ? "#6c63ff" : "#2d2d4e", background: isResumeDrag ? "#6c63ff11" : "#1a1a2e" }}
              >
                <input {...getResumeInput()} />
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{resumeFile.name}</p>
                      <p className="text-xs text-[#94a3b8]">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <span className="ml-2 text-green-400 text-sm">✓ Ready</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📤</p>
                    <p className="font-medium mb-1">Drop your resume here</p>
                    <p className="text-xs text-[#94a3b8]">PDF, DOCX, DOC, TXT supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Profile Photo <span className="text-[#94a3b8] text-xs">(optional)</span></label>
              <div
                {...getPhotoProps()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: isPhotoDrag ? "#6c63ff" : "#2d2d4e", background: isPhotoDrag ? "#6c63ff11" : "#1a1a2e" }}
              >
                <input {...getPhotoInput()} />
                {photoPreview ? (
                  <div className="flex items-center justify-center gap-4">
                    <img src={photoPreview} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#6c63ff]" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{photoFile?.name}</p>
                      <p className="text-xs text-green-400">✓ Photo ready</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">🖼️</p>
                    <p className="font-medium mb-1">Drop your photo here</p>
                    <p className="text-xs text-[#94a3b8]">JPG, PNG, WebP · Will appear on your portfolio</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleParseResume}
              disabled={loading || !resumeFile}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg, #6c63ff, #8b85ff)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> {loadingMsg}
                </span>
              ) : (
                "Parse Resume with AI →"
              )}
            </button>
          </div>
        )}

        {/* STEP 2: REVIEW */}
        {step === "review" && resumeData && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Review Extracted Data</h1>
              <p className="text-[#94a3b8] text-sm">AI has extracted your info. Review it before deploying.</p>
            </div>

            {/* Basic Info Card */}
            <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-5">
              <h2 className="font-semibold text-[#6c63ff] mb-4 text-sm uppercase tracking-wide">Personal Info</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name", resumeData.name],
                  ["Title", resumeData.title],
                  ["Location", resumeData.location],
                  ["Email", resumeData.email],
                  ["Phone", resumeData.phone],
                  ["LinkedIn", resumeData.linkedin],
                ].map(([label, val]) => val && (
                  <div key={label}>
                    <p className="text-xs text-[#94a3b8]">{label}</p>
                    <p className="text-sm font-medium truncate">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Education", resumeData.education.length + " entries"],
                ["Experience", resumeData.experience.length + " roles"],
                ["Skills", resumeData.skills.length + " skills"],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-[#6c63ff]">{val.split(" ")[0]}</p>
                  <p className="text-xs text-[#94a3b8]">{label}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-5">
                <h2 className="font-semibold text-[#6c63ff] mb-2 text-sm uppercase tracking-wide">Summary</h2>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{resumeData.summary}</p>
              </div>
            )}

            {/* Skills preview */}
            {resumeData.skills.length > 0 && (
              <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-5">
                <h2 className="font-semibold text-[#6c63ff] mb-3 text-sm uppercase tracking-wide">Skills Detected</h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.slice(0, 12).map((s) => (
                    <span key={s.name} className="text-xs px-3 py-1 rounded-full border" style={{ background: "rgba(108,99,255,0.1)", borderColor: "rgba(108,99,255,0.3)", color: "#6c63ff" }}>
                      {s.name} · {s.percentage}%
                    </span>
                  ))}
                  {resumeData.skills.length > 12 && <span className="text-xs text-[#94a3b8]">+{resumeData.skills.length - 12} more</span>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("upload")} className="flex-1 py-3 rounded-xl font-medium border border-[#2d2d4e] text-[#94a3b8] hover:border-[#6c63ff] hover:text-white transition-all">
                ← Re-upload
              </button>
              <button
                onClick={() => setStep("deploy")}
                className="flex-1 py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(90deg, #6c63ff, #8b85ff)" }}
              >
                Looks Good → Deploy
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEPLOY */}
        {step === "deploy" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Deploy to GitHub Pages</h1>
              <p className="text-[#94a3b8] text-sm">Enter your GitHub credentials to publish your portfolio.</p>
            </div>

            {/* Token Instructions */}
            <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-5 text-sm">
              <h3 className="font-semibold mb-2 text-[#6c63ff]">How to get a GitHub Token</h3>
              <ol className="text-[#94a3b8] space-y-1 list-decimal list-inside text-xs leading-relaxed">
                <li>Go to GitHub → Settings → Developer settings → Personal access tokens</li>
                <li>Click &quot;Generate new token (classic)&quot;</li>
                <li>Check: <code className="bg-[#0f0f1a] px-1 rounded">repo</code>, <code className="bg-[#0f0f1a] px-1 rounded">workflow</code>, <code className="bg-[#0f0f1a] px-1 rounded">pages</code></li>
                <li>Copy the token and paste it below</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GitHub Personal Access Token <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ background: "#1a1a2e", borderColor: githubToken ? "#6c63ff" : "#2d2d4e", color: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Repository Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="my-portfolio"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ background: "#1a1a2e", borderColor: repoName ? "#6c63ff" : "#2d2d4e", color: "#e2e8f0" }}
              />
              <p className="text-xs text-[#94a3b8] mt-1">Your portfolio URL: https://username.github.io/{repoName}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("review")} className="flex-1 py-3 rounded-xl font-medium border border-[#2d2d4e] text-[#94a3b8] hover:border-[#6c63ff] hover:text-white transition-all">
                ← Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={loading || !githubToken || !repoName}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(90deg, #6c63ff, #8b85ff)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span> {loadingMsg}
                  </span>
                ) : (
                  "🚀 Deploy Portfolio"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DONE */}
        {step === "done" && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Portfolio Deployed!</h1>
              <p className="text-[#94a3b8] text-sm">Your portfolio is live on GitHub Pages.</p>
            </div>

            <div className="bg-[#1a1a2e] border border-[#6c63ff33] rounded-xl p-6">
              <p className="text-xs text-[#94a3b8] mb-2">Your portfolio URL</p>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6c63ff] font-medium hover:underline break-all"
              >
                {deployedUrl}
              </a>
              <p className="text-xs text-[#94a3b8] mt-3">
                Note: GitHub Pages may take 1-2 minutes to go live after first deployment.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl font-semibold text-white text-center"
                style={{ background: "linear-gradient(90deg, #6c63ff, #8b85ff)" }}
              >
                View Portfolio →
              </a>
              <button
                onClick={() => { setStep("upload"); setResumeFile(null); setPhotoFile(null); setPhotoPreview(""); setResumeData(null); setGithubToken(""); setDeployedUrl(""); }}
                className="flex-1 py-3 rounded-xl font-medium border border-[#2d2d4e] text-[#94a3b8] hover:border-[#6c63ff] hover:text-white transition-all"
              >
                Build Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
