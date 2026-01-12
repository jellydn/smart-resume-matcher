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
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
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

| Key                       | Description        | Required | Default |
| ------------------------- | ------------------ | -------- | ------- |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key | No       | -       |
| `VITE_OPENAI_API_KEY`     | OpenAI API key     | No       | -       |
| `VITE_ANTHROPIC_API_KEY`  | Anthropic API key  | No       | -       |

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
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Run linter
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💖 Show your support

Give a ⭐️ if this project helped you!

[![kofi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/dunghd)
[![paypal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/dunghd)
[![buymeacoffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/dunghd)

## 📄 License

[MIT](./LICENSE) © 2026 [Huynh Duc Dung](https://github.com/jellydn)
