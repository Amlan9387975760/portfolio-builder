import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)" }}>
      {/* Hero */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-[#6c63ff1a] border border-[#6c63ff44] rounded-full px-4 py-1.5 text-sm text-[#6c63ff] mb-8">
          ✨ Smart Portfolio Generator
        </div>
        <h1 className="text-5xl font-extrabold leading-tight mb-6">
          Turn your resume into a{" "}
          <span style={{ background: "linear-gradient(90deg, #6c63ff, #ff6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            stunning portfolio
          </span>
        </h1>
        <p className="text-[#94a3b8] text-lg mb-10 leading-relaxed">
          Upload your resume, add your photo, and get a beautiful portfolio website hosted on GitHub Pages — in under a minute.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: "linear-gradient(90deg, #6c63ff, #8b85ff)" }}
        >
          Get Started — It&apos;s Free →
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-3xl w-full">
        {[
          { icon: "📄", title: "Any Resume Format", desc: "PDF, DOCX, TXT — our AI reads them all." },
          { icon: "⚡", title: "Instant Smart Parsing", desc: "Automatically extracts and structures all your resume data." },
          { icon: "🚀", title: "GitHub Pages Hosting", desc: "Deployed live instantly with a shareable URL." },
        ].map((f) => (
          <div key={f.title} className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-[#94a3b8]">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-[#475569]">
        Built by{" "}
        <a href="https://github.com/amlan9387975760" target="_blank" className="text-[#6c63ff] hover:underline">
          Amlan Kashyap
        </a>
      </p>
    </main>
  );
}
