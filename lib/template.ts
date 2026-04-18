import { ResumeData } from "./types";

export function generatePortfolioHTML(data: ResumeData, photoExt: string = "jpg"): string {
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skillsHTML = data.skills
    .map(
      (s) => `
      <div class="skill-item">
        <div class="skill-header">
          <span class="skill-name">${s.name}</span>
          <span class="skill-pct">${s.percentage}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" style="width:${s.percentage}%" data-width="${s.percentage}%"></div>
        </div>
        <span class="skill-cat">${s.category}</span>
      </div>`
    )
    .join("");

  const eduHTML = data.education
    .map(
      (e) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3 class="timeline-title">${e.degree}</h3>
          <p class="timeline-sub">${e.institution}</p>
          <span class="timeline-year">${e.year}</span>
          ${e.grade ? `<p class="timeline-grade">Grade: ${e.grade}</p>` : ""}
          ${e.description ? `<p class="timeline-desc">${e.description}</p>` : ""}
        </div>
      </div>`
    )
    .join("");

  const expHTML = data.experience
    .map(
      (e) => `
      <div class="exp-card">
        <div class="exp-header">
          <div>
            <h3 class="exp-title">${e.title}</h3>
            <p class="exp-company">${e.company} · ${e.location}</p>
          </div>
          <span class="exp-duration">${e.duration}</span>
        </div>
        <ul class="exp-list">
          ${e.description.map((d) => `<li>${d}</li>`).join("")}
        </ul>
        <div class="exp-tags">
          ${e.skills.map((s) => `<span class="tag">${s}</span>`).join("")}
        </div>
      </div>`
    )
    .join("");

  const projectsHTML = data.projects
    .map(
      (p) => `
      <div class="project-card">
        <h3 class="project-name">${p.name}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">
          ${p.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">View Project →</a>` : ""}
      </div>`
    )
    .join("");

  const awardsHTML = data.achievements
    .map(
      (a) => `
      <div class="award-card">
        <div class="award-icon">🏆</div>
        <div class="award-content">
          <h3 class="award-title">${a.title}</h3>
          <p class="award-desc">${a.description}</p>
          ${a.year ? `<span class="award-year">${a.year}</span>` : ""}
        </div>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name} — Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0f0f1a;
      --card: #1a1a2e;
      --card2: #16213e;
      --accent: #6c63ff;
      --accent2: #ff6584;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --border: #2d2d4e;
      --radius: 12px;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* ── LAYOUT ── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

    /* ── SIDEBAR ── */
    .layout { display: flex; min-height: 100vh; }

    .sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--card);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .avatar-wrap {
      width: 120px; height: 120px;
      border-radius: 50%;
      border: 3px solid var(--accent);
      overflow: hidden;
      margin-bottom: 16px;
      background: var(--card2);
    }

    .avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }

    .avatar-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; font-weight: 700; color: var(--accent);
    }

    .sidebar-name { font-size: 1.25rem; font-weight: 700; text-align: center; margin-bottom: 4px; }
    .sidebar-title { font-size: 0.8rem; color: var(--accent); text-align: center; margin-bottom: 8px; }
    .sidebar-location { font-size: 0.75rem; color: var(--muted); margin-bottom: 20px; }

    .badge {
      display: inline-block;
      background: rgba(108,99,255,0.15);
      color: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 0.7rem;
      margin-bottom: 24px;
    }

    .stats { display: flex; gap: 12px; margin-bottom: 28px; }
    .stat { text-align: center; }
    .stat-val { font-size: 1.1rem; font-weight: 700; color: var(--accent); }
    .stat-lbl { font-size: 0.65rem; color: var(--muted); }

    .contact-list { width: 100%; list-style: none; }
    .contact-list li {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px;
      background: var(--card2);
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 0.78rem;
      color: var(--muted);
      word-break: break-all;
    }
    .contact-list li a { color: var(--muted); text-decoration: none; }
    .contact-list li a:hover { color: var(--accent); }
    .contact-icon { font-size: 1rem; flex-shrink: 0; }

    /* ── MAIN ── */
    .main { flex: 1; padding: 40px 40px; overflow-y: auto; }

    /* ── TABS ── */
    .tabs { display: flex; gap: 4px; margin-bottom: 36px; flex-wrap: wrap; }
    .tab-btn {
      padding: 8px 18px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--text); background: var(--border); }
    .tab-btn.active { background: var(--accent); color: #fff; }

    .tab-panel { display: none; }
    .tab-panel.active { display: block; animation: fadeIn 0.3s ease; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── SECTION TITLES ── */
    .section-title {
      font-size: 1.5rem; font-weight: 700;
      margin-bottom: 24px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-title::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    /* ── HOME ── */
    .home-greeting { font-size: 0.9rem; color: var(--accent); margin-bottom: 8px; }
    .home-name { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 8px; }
    .home-role { font-size: 1.1rem; color: var(--muted); margin-bottom: 20px; }
    .home-summary {
      font-size: 0.9rem; line-height: 1.8; color: var(--muted);
      background: var(--card);
      border-left: 3px solid var(--accent);
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
    }

    /* ── TIMELINE (EDU) ── */
    .timeline { position: relative; padding-left: 24px; }
    .timeline::before {
      content: ''; position: absolute; left: 7px; top: 0; bottom: 0;
      width: 2px; background: var(--border);
    }
    .timeline-item { position: relative; margin-bottom: 28px; }
    .timeline-dot {
      position: absolute; left: -24px; top: 6px;
      width: 14px; height: 14px;
      border-radius: 50%; background: var(--accent);
      border: 2px solid var(--bg);
    }
    .timeline-content {
      background: var(--card);
      border-radius: var(--radius);
      padding: 16px 20px;
      border: 1px solid var(--border);
    }
    .timeline-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .timeline-sub { font-size: 0.85rem; color: var(--accent); margin-bottom: 6px; }
    .timeline-year {
      display: inline-block; font-size: 0.72rem;
      background: rgba(108,99,255,0.15); color: var(--accent);
      padding: 2px 10px; border-radius: 20px; margin-bottom: 8px;
    }
    .timeline-grade { font-size: 0.8rem; color: var(--muted); }
    .timeline-desc { font-size: 0.8rem; color: var(--muted); margin-top: 6px; }

    /* ── EXPERIENCE ── */
    .exp-card {
      background: var(--card);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 20px 24px;
      margin-bottom: 20px;
      transition: border-color 0.2s;
    }
    .exp-card:hover { border-color: var(--accent); }
    .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .exp-title { font-size: 1rem; font-weight: 600; }
    .exp-company { font-size: 0.82rem; color: var(--accent); margin-top: 2px; }
    .exp-duration {
      font-size: 0.72rem; color: var(--muted);
      background: var(--card2); padding: 4px 10px; border-radius: 20px; white-space: nowrap;
    }
    .exp-list { padding-left: 18px; margin-bottom: 12px; }
    .exp-list li { font-size: 0.83rem; color: var(--muted); margin-bottom: 5px; line-height: 1.6; }
    .exp-tags { display: flex; flex-wrap: wrap; gap: 6px; }

    /* ── TAGS ── */
    .tag {
      display: inline-block;
      background: rgba(108,99,255,0.1);
      color: var(--accent);
      border: 1px solid rgba(108,99,255,0.3);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
    }

    /* ── SKILLS ── */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .skill-item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
    }
    .skill-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .skill-name { font-size: 0.88rem; font-weight: 600; }
    .skill-pct { font-size: 0.82rem; color: var(--accent); font-weight: 600; }
    .skill-bar {
      height: 6px; background: var(--border);
      border-radius: 3px; overflow: hidden; margin-bottom: 8px;
    }
    .skill-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2));
      border-radius: 3px; width: 0;
      transition: width 1s ease;
    }
    .skill-cat { font-size: 0.68rem; color: var(--muted); }

    /* ── PROJECTS ── */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .project-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .project-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .project-name { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
    .project-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.6; margin-bottom: 12px; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .project-link { font-size: 0.8rem; color: var(--accent); text-decoration: none; }
    .project-link:hover { text-decoration: underline; }

    /* ── AWARDS ── */
    .award-card {
      display: flex; gap: 16px; align-items: flex-start;
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 20px; margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .award-card:hover { border-color: var(--accent2); }
    .award-icon { font-size: 1.8rem; }
    .award-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
    .award-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.5; }
    .award-year {
      display: inline-block; font-size: 0.7rem;
      color: var(--accent2); margin-top: 6px;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
      .layout { flex-direction: column; }
      .sidebar { width: 100%; height: auto; position: relative; padding: 24px 16px; }
      .main { padding: 24px 16px; }
      .home-name { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
<div class="layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="avatar-wrap">
      <img src="profile.${photoExt}" alt="${data.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="avatar-fallback" style="display:none">${initials}</div>
    </div>
    <div class="sidebar-name">${data.name}</div>
    <div class="sidebar-title">${data.title}</div>
    <div class="sidebar-location">📍 ${data.location}</div>
    <div class="badge">✅ Available for Opportunities</div>
    <div class="stats">
      ${data.yearsOfExperience ? `<div class="stat"><div class="stat-val">${data.yearsOfExperience} Yrs</div><div class="stat-lbl">Experience</div></div>` : ""}
      ${data.companiesWorked ? `<div class="stat"><div class="stat-val">${data.companiesWorked}</div><div class="stat-lbl">Companies</div></div>` : ""}
      ${data.highestDegree ? `<div class="stat"><div class="stat-val" style="font-size:0.75rem">${data.highestDegree}</div><div class="stat-lbl">Degree</div></div>` : ""}
    </div>
    <ul class="contact-list">
      ${data.email ? `<li><span class="contact-icon">✉️</span><a href="mailto:${data.email}">${data.email}</a></li>` : ""}
      ${data.phone ? `<li><span class="contact-icon">📞</span>${data.phone}</li>` : ""}
      ${data.linkedin ? `<li><span class="contact-icon">💼</span><a href="https://${data.linkedin}" target="_blank">${data.linkedin}</a></li>` : ""}
      ${data.github ? `<li><span class="contact-icon">💻</span><a href="https://${data.github}" target="_blank">${data.github}</a></li>` : ""}
    </ul>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <!-- TABS -->
    <nav class="tabs">
      <button class="tab-btn active" onclick="showTab('home', this)">Home</button>
      ${data.education.length ? `<button class="tab-btn" onclick="showTab('edu', this)">Education</button>` : ""}
      ${data.experience.length ? `<button class="tab-btn" onclick="showTab('work', this)">Work</button>` : ""}
      ${data.skills.length ? `<button class="tab-btn" onclick="showTab('skills', this)">Skills</button>` : ""}
      ${data.projects.length ? `<button class="tab-btn" onclick="showTab('projects', this)">Projects</button>` : ""}
      ${data.achievements.length ? `<button class="tab-btn" onclick="showTab('awards', this)">Awards</button>` : ""}
    </nav>

    <!-- HOME -->
    <div id="tab-home" class="tab-panel active">
      <p class="home-greeting">Hello, World! 👋</p>
      <h1 class="home-name">${data.name}</h1>
      <p class="home-role">${data.title}</p>
      <div class="home-summary">${data.summary}</div>
    </div>

    <!-- EDUCATION -->
    <div id="tab-edu" class="tab-panel">
      <h2 class="section-title">Education</h2>
      <div class="timeline">${eduHTML}</div>
    </div>

    <!-- WORK -->
    <div id="tab-work" class="tab-panel">
      <h2 class="section-title">Work Experience</h2>
      ${expHTML}
    </div>

    <!-- SKILLS -->
    <div id="tab-skills" class="tab-panel">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">${skillsHTML}</div>
    </div>

    <!-- PROJECTS -->
    <div id="tab-projects" class="tab-panel">
      <h2 class="section-title">Projects</h2>
      <div class="projects-grid">${projectsHTML}</div>
    </div>

    <!-- AWARDS -->
    <div id="tab-awards" class="tab-panel">
      <h2 class="section-title">Achievements & Awards</h2>
      ${awardsHTML}
    </div>
  </main>
</div>

<script>
  function showTab(id, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    btn.classList.add('active');
    if (id === 'skills') animateSkills();
  }

  function animateSkills() {
    document.querySelectorAll('.skill-fill').forEach(el => {
      const w = el.getAttribute('data-width');
      el.style.width = w;
    });
  }

  // Auto-animate skills on first visit if already on skills tab
  window.addEventListener('load', () => {
    setTimeout(animateSkills, 100);
  });
</script>
</body>
</html>`;
}
