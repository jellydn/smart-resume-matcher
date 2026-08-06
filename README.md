<img src="./public/readme-logo.svg" alt="Smart Resume Matcher" width="250" height="50"/>

# Smart Resume Matcher

**AI-Powered Resume Tailoring for Job Applications**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-v7-CA3A47?style=flat&logo=reactrouter)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 💭 Motivation

Job hunting is time-consuming, and tailoring resumes for each application is tedious work:

- **Generic resumes**: One-size-fits-all resumes rarely pass ATS filters
- **Manual rewriting**: Rephrasing bullet points for each job is exhausting
- **Lost opportunities**: Missing keywords means getting rejected before human review

**Smart Resume Matcher** automates the tailoring process while keeping your resume truthful—only rewording and emphasizing your actual experience to match job requirements.

## ✨ Features

|                                                                                                                                                                                                    |                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📤 **Multiple Input Methods** Upload JSON file or use comprehensive web form for personal info, experience, education, skills, languages, certifications, projects, and open source contributions. | 🤖 **Flexible AI Providers** Support for OpenRouter, OpenAI, Anthropic Claude, WebLLM (browser-based, free), and Ollama (local).                          |
| ✨ **Smart Tailoring** AI analyzes job descriptions, suggests reworded bullet points, recommends skills to emphasize, and shows match score—without fabricating experience.                        | 👁️ **Side-by-Side Comparison** View original vs tailored resume, accept/reject individual suggestions, manual edit capability, real-time preview updates. |
| 📄 **Professional Export** Download as formatted PDF or DOCX with clean template, filename includes job title/company.                                                                             | 💾 **Privacy-First Storage** Works fully without login, localStorage persistence, API keys stored locally with warnings, optional cloud sync.             |

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/jellydn/smart-resume-matcher.git
   cd smart-resume-matcher
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

## 📖 Usage

### 1. Enter Your Resume Data

**Option A: Upload JSON**

- Click "Upload JSON" and select your resume data file
- The app validates and parses your data automatically

**Option B: Web Form**

- Fill out sections: Personal Info, Experience, Education, Skills, Languages, Certifications, Projects, Open Source
- Save draft to localStorage as you work

### 2. Paste Job Description

- Paste the LinkedIn job URL or job description text
- App extracts key requirements, skills, and qualifications
- Review parsed job requirements summary

### 3. Configure AI Provider

| Provider       | Requires Key | Description                                          |
| -------------- | ------------ | ---------------------------------------------------- |
| **OpenRouter** | Yes          | Access to multiple models with one key (recommended) |
| **OpenAI**     | Yes          | Direct OpenAI API access                             |
| **Anthropic**  | Yes          | Claude API access                                    |
| **WebLLM**     | No           | Browser-based AI, free but slower                    |
| **Ollama**     | No           | Local AI, requires Ollama running                    |

Click "Test Connection" to verify your API key works.

### 4. Review & Tailor

- View AI suggestions side-by-side with original content
- Click ✓ to accept or ✗ to reject individual changes
- Make manual edits to any section
- Real-time preview updates as you make changes

### 5. Download

- Click "Download PDF" or "Download DOCX"
- File is named with job title/company for easy organization

## ⚙️ Configuration

### Environment Variables

| Key                       | Description                                         | Required    | Default            |
| ------------------------- | --------------------------------------------------- | ----------- | ------------------ |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key                                  | No          | -                  |
| `VITE_OPENAI_API_KEY`     | OpenAI API key                                      | No          | -                  |
| `VITE_ANTHROPIC_API_KEY`  | Anthropic API key                                   | No          | -                  |
| `DATABASE_TYPE`           | Database engine: `sqlite` or `postgres`              | No          | `sqlite`           |
| `DATABASE_PATH`           | SQLite database file path (local development)        | No          | `./data/sqlite.db` |
| `DATABASE_URL`            | PostgreSQL connection URL (required for `postgres`)  | Conditional | -                  |
| `APP_URL`                 | Public URL of your deployment (e.g. `https://app.example.com`); used as the default trusted origin for auth | No          | -                  |
| `AUTH_TRUSTED_ORIGINS`    | Comma-separated list of allowed auth origins; overrides `APP_URL` when multiple domains must be trusted | No          | `APP_URL` or `http://localhost:5173` |

### Local Storage Keys

| Key           | Description              |
| ------------- | ------------------------ |
| `resume-data` | User's resume data       |
| `ai-provider` | Selected AI provider     |
| `api-keys`    | Encrypted API keys       |
| `job-history` | Last 10 job descriptions |

## 📄 Resume JSON Schema

```json
{
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string",
    "summary": "string"
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string | null",
      "current": "boolean",
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "graduationDate": "string",
      "gpa": "string | null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "beginner | intermediate | advanced | expert"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "basic | conversational | professional | native"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "url": "string | null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "url": "string | null",
      "technologies": ["string"],
      "highlights": ["string"],
      "startDate": "string | null",
      "endDate": "string | null"
    }
  ],
  "openSource": [
    {
      "project": "string",
      "role": "contributor | maintainer | creator",
      "url": "string",
      "description": "string",
      "contributions": ["string"]
    }
  ]
}
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Type check
pnpm run typecheck

# Build for production
pnpm run build

# Run linter
pnpm run lint
```

### Database

The app uses **SQLite** locally by default. To use **PostgreSQL**, set `DATABASE_TYPE=postgres` and provide `DATABASE_URL`. PostgreSQL support is currently under review; verify authentication compatibility and existing migration history before using it in production.

```bash
# Generate a migration from the current schema
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Push schema directly (no migration files)
pnpm run db:push

# Open Drizzle Studio to browse the database
pnpm run db:studio
```

Dialect-specific variants are available when targeting a single engine. Migration output is separated by dialect under `drizzle/sqlite` and `drizzle/postgres`.

When upgrading an existing checkout, verify the migration history before running a migrate command.

```bash
pnpm run db:generate:sqlite
pnpm run db:migrate:sqlite
pnpm run db:push:sqlite
pnpm run db:studio:sqlite

pnpm run db:generate:postgres
pnpm run db:migrate:postgres
pnpm run db:push:postgres
pnpm run db:studio:postgres
```

## 🚀 Dokku Deployment

The application is configured for deployment on Dokku via Dockerfile and pnpm.

### Dokku Server Setup

```bash
# Create Dokku app
ssh dokku@<your-dokku-host> apps:create smart-resume-matcher

# Set up persistent storage for SQLite database
ssh dokku@<your-dokku-host> storage:ensure-directory smart-resume-matcher-data
ssh dokku@<your-dokku-host> storage:mount smart-resume-matcher /var/lib/dokku/data/storage/smart-resume-matcher-data:/app/data

# Configure environment variables (BETTER_AUTH_SECRET is auto-generated via app.json if omitted)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
ssh dokku@<your-dokku-host> config:set smart-resume-matcher NODE_ENV=production DATABASE_TYPE=sqlite DATABASE_PATH=/app/data/sqlite.db BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" APP_URL="https://<your-app-domain>"

> `APP_URL` is required in production so Better Auth trusts your real domain
> instead of falling back to `http://localhost:5173`.

### Deploy via Git

```bash
# Add Dokku git remote
git remote add dokku dokku@<your-dokku-host>:smart-resume-matcher

# Push to deploy
git push dokku main
```

### Deploy via GitHub Actions (optional)

The workflow `.github/workflows/deploy-dokku.yml` deploys automatically on every push to `main`. Configure these repository secrets (Settings → Secrets and variables → Actions):

| Secret                    | Required    | Description                                                        |
| ------------------------- | ----------- | ------------------------------------------------------------------ |
| `DOKKU_GIT_REMOTE_URL`    | Yes         | Dokku git remote, e.g. `dokku@<host>:smart-resume-matcher`. The deploy fails if missing. |
| `DOKKU_SSH_PRIVATE_KEY`   | Yes         | SSH private key authorized to push to the Dokku app.               |
| `DOKKU_SSH_HOST_KEY`      | No          | SSH host key of the Dokku server; recommended to prevent host key spoofing. |
| `DOKKU_TRACE`             | No          | Set to `true` for verbose deploy output (default `false`).         |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💖 Show your support

Give a ⭐️ if this project helped you!

[![kofi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/dunghd)
[![paypal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/dunghd)
[![buymeacoffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/dunghd)

## 📄 License

[MIT](./LICENSE) © 2026 [Huynh Duc Dung](https://github.com/jellydn)
