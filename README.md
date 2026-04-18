# PortfolioBuilder

AI-powered portfolio website generator. Upload your resume → get a live GitHub Pages portfolio in seconds.

## Features

- Upload resume in PDF, DOCX, DOC, or TXT format
- Optional profile photo upload
- AI (Claude) parses your resume and extracts all data
- Generates a beautiful portfolio website (same design as reference portfolio)
- Auto-deploys to GitHub Pages

## Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/portfolio-builder
   cd portfolio-builder
   npm install
   ```

2. **Set environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Anthropic API key to .env.local
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## How to Use

1. Go to `/dashboard`
2. Upload your resume (PDF/DOCX/TXT)
3. Upload your profile photo (optional)
4. Review the AI-extracted data
5. Enter your GitHub Personal Access Token
6. Enter a repo name (e.g. `my-portfolio`)
7. Click Deploy — your portfolio goes live at `https://username.github.io/my-portfolio`

## GitHub Token Permissions Required

When creating your token, enable:
- `repo` (full repository access)
- `workflow`
- `pages`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Claude API (Anthropic) for resume parsing
- **Deployment**: GitHub API + GitHub Pages via Octokit
