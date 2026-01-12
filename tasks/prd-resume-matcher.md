# PRD: LinkedIn Resume Matcher

## Introduction

A web application that helps job seekers tailor their resumes to specific LinkedIn job postings. Users input their complete professional profile (via JSON upload or web form), paste a LinkedIn job description, and the AI analyzes and adjusts the resume to better match the job requirements while staying truthful to the user's actual experience.

## Goals

- Allow users to input their professional data via JSON file upload OR web form
- Accept LinkedIn job URLs and job descriptions as input
- Use AI to tailor resumes to match job requirements (without fabricating experience)
- Generate downloadable PDF/DOCX resumes ready for applications
- Support multiple AI providers (user's API key, open-source, or browser-based AI)
- Work without login, with optional account for saving data

## User Stories

### US-001: JSON Resume Data Upload

**Description:** As a user, I want to upload a JSON file containing my professional data so that I can quickly import my resume information.

**Acceptance Criteria:**

- [ ] File upload accepts .json files
- [ ] Validates JSON structure against expected schema
- [ ] Shows clear error messages for invalid JSON
- [ ] Displays parsed data preview after upload
- [ ] Typecheck passes

### US-002: Web Form Resume Input

**Description:** As a user, I want to manually enter my resume data through a web form so that I can create my profile without preparing a JSON file.

**Acceptance Criteria:**

- [ ] Form sections: Personal Info, Experience, Education, Skills, Languages, Certifications, Projects, Open Source
- [ ] Experience section allows adding multiple entries with: title, company, dates, description
- [ ] Skills section supports adding/removing individual skills with proficiency level
- [ ] Form validates required fields before proceeding
- [ ] Can save form data to local storage as draft
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Export Resume Data as JSON

**Description:** As a user, I want to export my entered data as JSON so that I can reuse it later.

**Acceptance Criteria:**

- [ ] "Export JSON" button available after data entry
- [ ] Downloads well-formatted JSON file
- [ ] Exported JSON can be re-imported successfully
- [ ] Typecheck passes

### US-004: Job Description Input

**Description:** As a user, I want to paste a LinkedIn job URL or job description so that the AI can analyze the requirements.

**Acceptance Criteria:**

- [ ] Text area accepts pasted job description
- [ ] Optional field for LinkedIn job URL
- [ ] Extracts key requirements, skills, and qualifications from description
- [ ] Shows parsed job requirements summary
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: AI Provider Configuration

**Description:** As a user, I want to choose my AI provider so that I can use my preferred service or a free option.

**Acceptance Criteria:**

- [ ] Settings panel with AI provider options
- [ ] Option 1: OpenRouter (access to multiple models with one key)
- [ ] Option 2: OpenAI (requires user API key)
- [ ] Option 3: Anthropic Claude (requires user API key)
- [ ] Option 4: Browser-based AI (WebLLM/Transformers.js) - no key needed
- [ ] Option 5: Ollama (local, requires Ollama running)
- [ ] API keys stored in local storage (with clear warning)
- [ ] Test connection button to verify API key works
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Resume Tailoring Engine

**Description:** As a user, I want the AI to analyze my resume against the job description and suggest tailored adjustments.

**Acceptance Criteria:**

- [ ] AI identifies matching skills/experience between resume and job
- [ ] AI suggests reworded bullet points to highlight relevant experience
- [ ] AI recommends skills to emphasize based on job requirements
- [ ] Shows match score/percentage
- [ ] Clearly marks AI suggestions vs original content
- [ ] Does NOT fabricate experience (only rewords/emphasizes existing)
- [ ] Typecheck passes

### US-007: Resume Preview and Edit

**Description:** As a user, I want to preview the tailored resume and make manual edits before downloading.

**Acceptance Criteria:**

- [ ] Side-by-side view: original vs tailored resume
- [ ] Accept/reject individual AI suggestions
- [ ] Manual edit capability for any section
- [ ] Real-time preview updates
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Resume Export as PDF/DOCX

**Description:** As a user, I want to download my tailored resume as PDF or DOCX for job applications.

**Acceptance Criteria:**

- [ ] "Download PDF" button generates formatted PDF
- [ ] "Download DOCX" button generates Word document
- [ ] Clean, professional resume template
- [ ] Filename includes job title or company name
- [ ] Typecheck passes

### US-009: Local Storage Persistence

**Description:** As a user without an account, I want my data saved in browser storage so I don't lose my work.

**Acceptance Criteria:**

- [ ] Resume data persists in localStorage
- [ ] Job history (last 10 jobs) saved locally
- [ ] Clear data option available
- [ ] Works fully offline after initial load
- [ ] Typecheck passes

### US-010: Optional User Account

**Description:** As a returning user, I want to optionally create an account so that I can access my data across devices.

**Acceptance Criteria:**

- [ ] "Sign up" / "Login" options (not required)
- [ ] Simple email/password or OAuth (Google)
- [ ] Syncs resume data to account when logged in
- [ ] App works fully without login
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Accept JSON file upload with resume data (personal info, experience, education, skills, languages, certifications, projects, open source contributions)
- FR-2: Provide web form for manual resume data entry with all sections
- FR-3: Store resume data in localStorage for non-authenticated users
- FR-4: Accept job description via text paste or LinkedIn URL
- FR-5: Parse job description to extract requirements, skills, qualifications
- FR-6: Support multiple AI providers: OpenRouter, OpenAI, Anthropic, WebLLM (browser), Ollama (local)
- FR-7: Store user API keys in localStorage with security warning
- FR-8: Generate tailored resume suggestions using selected AI provider
- FR-9: Display original vs tailored resume comparison
- FR-10: Allow accepting/rejecting individual AI suggestions
- FR-11: Export final resume as PDF using client-side generation
- FR-12: Export final resume as DOCX using client-side generation
- FR-13: Optional user accounts with cloud sync
- FR-14: Work offline after initial page load

## Non-Goals

- No automatic LinkedIn profile import (requires LinkedIn API approval)
- No job searching/browsing within the app
- No application tracking system
- No cover letter generation (v1)
- No resume templates selection (v1 - single clean template)
- No team/enterprise features
- No payment/subscription system

## Design Considerations

- Minimal, clean UI - focus on functionality
- Mobile-responsive but desktop-primary
- Dark/light mode support
- Step-by-step wizard flow: 1) Enter Data → 2) Paste Job → 3) Configure AI → 4) Review & Download
- Use existing component libraries (shadcn/ui or similar)

## Technical Considerations

- **Framework:** Remix or TanStack Start (SPA mode)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **PDF Generation:** @react-pdf/renderer or pdfmake (client-side)
- **DOCX Generation:** docx.js (client-side)
- **AI Providers:**
  - OpenRouter (recommended - single key, multiple models)
  - OpenAI, Anthropic (direct API)
  - WebLLM or Transformers.js (browser-based, free)
  - Ollama (local)
- **Database:** SQLite or PostgreSQL for optional accounts
- **Auth:** Simple JWT or OAuth (optional feature)
- **Storage:** localStorage for guest users, database for logged-in users

### Resume JSON Schema

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

## Success Metrics

- User can go from pasting job description to downloading tailored PDF in under 5 minutes
- AI suggestions maintain factual accuracy (no fabricated experience)
- Tailored resumes show measurable keyword match improvement
- App works fully without requiring user account or API key (via browser AI)

## Open Questions

- Should we support multiple resume templates in v1 or keep it simple?
- What's the fallback if browser AI is too slow on user's device?
- Should we add ATS (Applicant Tracking System) compatibility scoring?
- How to handle very long job descriptions that exceed AI context limits?
