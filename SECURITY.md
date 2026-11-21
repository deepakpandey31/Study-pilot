# Security Policy — StudyPilot AI (StudyTrack)

## Supported Versions

The following versions of StudyPilot are actively maintained and receive security patches:

| Version | Supported | Release Date |
| :--- | :---: | :--- |
| `0.1.x` (Current Main) | ✅ | November 2026 |

---

## 🔒 Security Architecture & Guardrails

StudyPilot AI enforces enterprise-grade security practices across its entire monorepo architecture:

### 1. HTTP Security Headers
All incoming requests to the web client are protected with hardened HTTP headers configured in `next.config.mjs`:
- **Content-Security-Policy (CSP):** Strict whitelist for script, style, and media sources.
- **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options:** `SAMEORIGIN` (prevents clickjacking attacks)
- **X-Content-Type-Options:** `nosniff` (mitigates MIME-confusion vulnerabilities)
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** Explicitly disallows unauthorized access to camera, microphone, and geolocation.

### 2. Prompt Injection Defense & AI Safety
The RAG StudyCoach engine strictly isolates user prompt inputs:
- Uploaded examination papers and user questions are treated strictly as **passive data** and never as executable instructions.
- System prompts are validated by an automated adherence test suite (`scripts/eval-prompts.mjs`) ensuring schemas and safety boundaries are strictly maintained.

### 3. API Rate Limiting & Denial of Service Protection
- `/api/gemini` enforces an in-memory IP-based sliding window rate limiter (maximum 30 requests per minute per IP address).
- Payload sanitization truncates queries exceeding 1,000 characters and strips harmful control characters.
- In-memory response caching (24-hour TTL) prevents duplicate upstream API calls.

### 4. Zero Hardcoded Secrets
- All API keys (e.g., `GEMINI_API_KEY`) and sensitive credentials are read strictly from environment variables (`process.env`).
- Environment variable schemas are documented in `.env.example`.
- Git history and staged files are scanned to prevent credential leaks.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within StudyPilot AI, please do **NOT** open a public issue.

Instead, please send an advisory email directly to:
**Lead Developer:** Deepak Pandey ([@deepakpandey31](https://github.com/deepakpandey31))  
**Email:** `pandeydeepak312005@gmail.com`

### Disclosure Policy
- We acknowledge receipt of vulnerability reports within **24 hours**.
- We provide an initial assessment and estimated fix timeline within **48 hours**.
- A patch will be published to `main` promptly upon verification.
