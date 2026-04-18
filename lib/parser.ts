import { ResumeData, Education, Experience, Skill, Project, Achievement } from "./types";

// ── Text extraction ────────────────────────────────────────────────────────

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return buffer.toString("utf-8");
}

// ── Section detection ──────────────────────────────────────────────────────

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary:      /^(summary|objective|profile|about\s*me|professional\s*summary)/i,
  education:    /^(education|academic|qualification)/i,
  experience:   /^(experience|work\s*experience|employment|professional\s*experience|career)/i,
  skills:       /^(skills|technical\s*skills|core\s*competencies|competencies|technologies)/i,
  projects:     /^(projects?|personal\s*projects?|academic\s*projects?|key\s*projects?)/i,
  achievements: /^(achievements?|awards?|honors?|certifications?|recognition|accomplishments?)/i,
};

function detectSection(line: string): string | null {
  const clean = line.trim().replace(/[:\-–—]/g, "").trim();
  if (clean.length > 50) return null;
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(clean)) return section;
  }
  return null;
}

function splitIntoSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = { header: [] };
  let current = "header";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const detected = detectSection(trimmed);
    if (detected) {
      current = detected;
      sections[current] = sections[current] || [];
    } else {
      sections[current] = sections[current] || [];
      sections[current].push(trimmed);
    }
  }
  return sections;
}

// ── Regex helpers ──────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{3,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{4,5}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w\-]+/i;
const GITHUB_RE = /github\.com\/[\w\-]+/i;
const DATE_RANGE_RE = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)?\s*\d{4})\s*[-–—to]+\s*(present|current|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)?\s*\d{4})/i;
const YEAR_RANGE_RE = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i;

// ── Parsers ────────────────────────────────────────────────────────────────

function parseContactInfo(headerLines: string[], allText: string): Partial<ResumeData> {
  const email = (allText.match(EMAIL_RE) || [])[0] || "";
  const phone = (allText.match(PHONE_RE) || [])[0] || "";
  const linkedin = (allText.match(LINKEDIN_RE) || [])[0] || "";
  const github = (allText.match(GITHUB_RE) || [])[0] || "";

  // Name = first non-empty line that doesn't look like a URL or email
  const nameLine = headerLines.find(
    (l) => l.trim().length > 2 && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !l.includes("http")
  );
  const name = nameLine ? nameLine.trim() : "";

  // Title = second meaningful line in header or just after name
  const titleLine = headerLines.find(
    (l) => l !== nameLine && l.trim().length > 3 && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !/^\+?\d/.test(l.trim())
  );
  const title = titleLine ? titleLine.trim() : "";

  // Location: look for "City, Country" or "City, State" pattern
  const locationRe = /\b([A-Z][a-z]+([\s,]+[A-Z][a-z]+){1,3})\b/;
  const locationLine = headerLines.find((l) => /,/.test(l) && !EMAIL_RE.test(l) && !PHONE_RE.test(l));
  const location = locationLine ? locationLine.trim() : "";

  return { name, title, location, email, phone, linkedin, github };
}

function parseSummary(lines: string[]): string {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

function parseEducation(lines: string[]): Education[] {
  const degreeKeywords = /\b(B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|MBA|BCA|MCA|B\.?E|M\.?E|Ph\.?D|Bachelor|Master|Diploma|HSC|SSC|10th|12th|Matriculation|High\s*School)\b/i;
  const education: Education[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (degreeKeywords.test(line) || YEAR_RANGE_RE.test(line) || DATE_RANGE_RE.test(line)) {
      const degree = line.trim();
      const institution = lines[i + 1]?.trim() || "";
      const yearMatch = line.match(YEAR_RANGE_RE) || line.match(DATE_RANGE_RE) ||
        lines[i + 1]?.match(YEAR_RANGE_RE) || lines[i + 2]?.match(YEAR_RANGE_RE);
      const year = yearMatch ? yearMatch[0] : "";
      const gradeMatch = (lines[i + 2] || lines[i + 3] || "").match(/(?:cgpa|gpa|grade|percentage|marks)[:\s]*([\d.]+[%/\w]*)/i);
      const grade = gradeMatch ? gradeMatch[0] : "";
      education.push({ degree, institution, year, grade });
      i += 3;
    } else {
      i++;
    }
  }

  return education.filter((e) => e.degree || e.institution);
}

function parseExperience(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  let currentExp: Partial<Experience> | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE) || line.match(YEAR_RANGE_RE);

    if (dateMatch) {
      if (currentExp?.title) experiences.push(currentExp as Experience);
      currentExp = {
        title: line.replace(dateMatch[0], "").trim() || "Position",
        company: "",
        duration: dateMatch[0],
        location: "",
        description: [],
        skills: [],
      };
    } else if (currentExp) {
      if (!currentExp.company && !/^[-•◦*]/.test(line) && line.length < 60) {
        currentExp.company = line;
      } else if (/^[-•◦*]/.test(line)) {
        currentExp.description = [...(currentExp.description || []), line.replace(/^[-•◦*]\s*/, "")];
      } else if (currentExp.description && currentExp.description.length > 0) {
        const last = currentExp.description[currentExp.description.length - 1];
        currentExp.description[currentExp.description.length - 1] = last + " " + line;
      }
    } else if (!currentExp && line.length < 80 && !line.startsWith("-")) {
      currentExp = { title: line, company: "", duration: "", location: "", description: [], skills: [] };
    }
  }

  if (currentExp?.title) experiences.push(currentExp as Experience);
  return experiences.filter((e) => e.title);
}

const SKILLS_DICT = [
  "JavaScript","TypeScript","Python","Java","C++","C#","Go","Rust","Ruby","PHP","Swift","Kotlin","Dart","Scala","R",
  "React","Next.js","Vue","Angular","Node.js","Express","Django","Flask","FastAPI","Spring","Laravel","Rails",
  "HTML","CSS","Tailwind","SASS","Bootstrap","GraphQL","REST API","gRPC","WebSockets",
  "SQL","MySQL","PostgreSQL","MongoDB","Redis","Elasticsearch","Firebase","DynamoDB","Oracle","SQLite",
  "AWS","Azure","GCP","Docker","Kubernetes","Terraform","CI/CD","GitHub Actions","Jenkins","Ansible",
  "Git","Linux","Bash","PowerShell","Nginx","Apache",
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","Scikit-learn","Pandas","NumPy","OpenCV","NLP",
  "Excel","PowerPoint","Word","Tableau","Power BI","Looker","Figma","Sketch","Adobe XD",
  "Agile","Scrum","Jira","Confluence","Project Management","Leadership","Communication",
  "Client Success","Operations","Business Development","Sales","Marketing","Product Management",
  "Data Analysis","Data Science","Business Intelligence","Six Sigma","Lean","ITIL",
];

function parseSkills(lines: string[], allText: string): Skill[] {
  const found = new Set<string>();
  const text = lines.join(" ") + " " + allText;

  // 1. Match against known skills dict
  for (const skill of SKILLS_DICT) {
    const re = new RegExp(`\\b${skill.replace(/[.+]/g, "\\$&")}\\b`, "i");
    if (re.test(text)) found.add(skill);
  }

  // 2. Parse comma/pipe/newline-separated items in the skills section
  const rawSkills = lines.join(",").split(/[,|•\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40);
  for (const s of rawSkills) {
    if (!/^\d/.test(s) && !/[<>{}()]/.test(s)) found.add(s);
  }

  return Array.from(found).map((name, i) => ({
    name,
    percentage: 85 - (i % 3) * 10,
    category: categorizeSkill(name),
  }));
}

function categorizeSkill(skill: string): string {
  const tech = /JavaScript|TypeScript|Python|Java|C\+\+|Go|React|Next|Vue|Angular|Node|Django|Flask|SQL|AWS|Docker|Git|Machine Learning|TensorFlow/i;
  const soft = /Leadership|Communication|Management|Agile|Scrum|Client|Sales|Marketing|Business/i;
  if (tech.test(skill)) return "Technical";
  if (soft.test(skill)) return "Soft Skill";
  return "Domain";
}

function parseProjects(lines: string[]): Project[] {
  const projects: Project[] = [];
  let current: Partial<Project> | null = null;

  for (const line of lines) {
    if (line.length < 60 && !line.startsWith("-") && !line.startsWith("•")) {
      if (current?.name) projects.push(current as Project);
      current = { name: line, description: "", technologies: [] };
    } else if (current) {
      if (!current.description) {
        current.description = line.replace(/^[-•]\s*/, "");
      } else {
        current.description += " " + line.replace(/^[-•]\s*/, "");
      }
      const techs = line.match(/\b(React|Node|Python|Java|SQL|MongoDB|AWS|Docker|HTML|CSS|JavaScript|TypeScript|Django|Flask|Next\.js|Vue|Angular)\b/gi) || [];
      current.technologies = [...(current.technologies || []), ...techs];
    }
  }

  if (current?.name) projects.push(current as Project);
  return projects
    .filter((p) => p.name)
    .map((p) => ({ ...p, technologies: [...new Set(p.technologies)] } as Project));
}

function parseAchievements(lines: string[]): Achievement[] {
  const achievements: Achievement[] = [];
  let current: Partial<Achievement> | null = null;

  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•")) {
      if (current?.title) achievements.push(current as Achievement);
      current = { title: line.replace(/^[-•]\s*/, ""), description: "" };
    } else if (current) {
      current.description = (current.description || "") + " " + line;
    } else {
      achievements.push({ title: line, description: "", year: (line.match(/\d{4}/) || [])[0] });
    }
  }

  if (current?.title) achievements.push(current as Achievement);
  return achievements.filter((a) => a.title).map((a) => ({
    ...a,
    title: a.title.trim(),
    description: (a.description || "").trim(),
  }));
}

// ── Main export ────────────────────────────────────────────────────────────

export async function parseResume(buffer: Buffer, mimeType: string, fileName: string): Promise<ResumeData> {
  const rawText = await extractText(buffer, mimeType);
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections = splitIntoSections(lines);

  const contact = parseContactInfo(sections.header || [], rawText);
  const education = parseEducation(sections.education || []);
  const experience = parseExperience(sections.experience || []);
  const skills = parseSkills(sections.skills || [], rawText);
  const projects = parseProjects(sections.projects || []);
  const achievements = parseAchievements(sections.achievements || []);
  const summary = parseSummary(sections.summary || []);

  const yearsMatch = rawText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
  const yearsOfExperience = yearsMatch ? yearsMatch[1] + "+" : experience.length > 0 ? `${experience.length}` : "0";

  const degreeKeywords = /M\.?Tech|MBA|M\.?Sc|Master|Ph\.?D/i;
  const allDegrees = education.map((e) => e.degree).join(" ");
  const highestDegree = degreeKeywords.test(allDegrees)
    ? (allDegrees.match(degreeKeywords) || [])[0] || "Graduate"
    : "Graduate";

  return {
    name: contact.name || fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    title: contact.title || (experience[0]?.title) || "Professional",
    location: contact.location || "",
    email: contact.email || "",
    phone: contact.phone || "",
    linkedin: contact.linkedin || "",
    github: contact.github || "",
    website: "",
    summary: summary || `${contact.name || "I"} am a ${contact.title || "professional"} with ${yearsOfExperience} years of experience.`,
    yearsOfExperience,
    companiesWorked: experience.length,
    highestDegree,
    education,
    experience,
    skills,
    projects,
    achievements,
  };
}
