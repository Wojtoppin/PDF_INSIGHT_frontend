# PDF Insight

React SPA that extracts text from a user-uploaded PDF, summarizes it, and turns it into structured JSON via an LLM. Ships as static files on GitHub Pages; the LLM call is proxied through a Cloudflare Worker so the API key never reaches the client. Recruitment brief: `Brief_Vibe_Coder_PDF_Insight.pdf` (24h deadline, demo must stay live 14 days).

## Architecture

```
Browser (React SPA, GitHub Pages)
  -> POST /analyze (Cloudflare Worker, holds API key in secrets)
  -> LLM API
```

Frontend never talks to the LLM directly. `VITE_API_URL` points the frontend at the Worker.

## Repo layout

- `src/` — the Vite/React frontend (see below).
- `worker/` — Cloudflare Worker source (`wrangler.toml`, entry `index.ts`). Deployed independently of the Pages build; holds the LLM API key as a Worker secret, never in `src/`.
- `public/` — static assets served as-is, including the `pdf.js` worker file (`pdf.worker.min.js`) that pdf.js needs at runtime.
- `AI_LOG.md` — running log of AI-assisted development: tools used, key prompts, where the AI got it wrong and how it was fixed. Update it as you go, covering both `src/` and `worker/` work — don't reconstruct it at the end.
- `.env.example` committed, `.env` gitignored, never committed even historically.

## `src/` structure

| Folder | Holds |
|---|---|
| `api/` | Fetch wrappers calling the Worker (`analyzeDocument(file)` etc.) — no direct LLM calls here, only calls to `VITE_API_URL`. |
| `assets/font/`, `assets/images/` | Static imports bundled by Vite. |
| `components/common/` | Reusable, feature-agnostic UI (Button, Spinner, ErrorBanner). |
| `components/<feature>/` | Feature-specific components live directly under `components/`, one folder per feature (e.g. `components/upload/`, `components/results/`) — not nested inside `common/`. |
| `constants/` | Literal values: `MAX_FILE_SIZE_MB`, `ACCEPTED_TYPES`, route paths. |
| `helpers/` | Pure functions with no React/store dependency. This is the brief's `lib/` under a project-preferred name — satisfies that structural requirement. |
| `hooks/` | Global, cross-feature hooks. Feature-local hooks live beside their feature component, not here. |
| `store/` | Zustand store, one slice per file, combined in `store/index.ts`. |
| `styles/` | Tailwind entry (`index.css` with `@tailwind` directives) and any Tailwind config overrides. No component-level CSS files — use Tailwind classes. |
| `types/` | Zod schemas as the single source of truth; TS types are `z.infer<typeof Schema>`, never hand-written duplicates. The brief's document-analysis schema (section 04) lives here as `documentAnalysis.schema.ts`. |
| `views/` | One component per route, wired through `react-router`. Views compose from `components/`; they don't hold business logic themselves. |

Tests are co-located `*.test.ts` next to the file they cover, run by Vitest — no separate `tests/` tree.

## Data contract

The Zod schema in `types/documentAnalysis.schema.ts` mirrors the brief's JSON exactly (section 04). Fields may be added, never removed or renamed. Missing information is `null` or `[]` — never fabricated. Every LLM response is parsed through this schema before it touches a component; on validation failure, retry the LLM call once, then surface the error state (F-06) — don't retry silently more than once.

## CI/CD

Two independent deploy targets, one workflow: `lint -> build -> deploy` for the Pages build (`src/`), plus a separate job deploying `worker/` via `wrangler deploy` using a `CLOUDFLARE_API_TOKEN` repo secret. Frontend deploy must not depend on the worker job succeeding, and vice versa — they ship on different platforms.

## Non-negotiables (brief sections 05/06 — violating these disqualifies the submission)

- LLM API key exists only as a Worker secret. It must never appear in `src/`, in a client bundle, or anywhere in git history.
- Worker CORS is restricted to the GitHub Pages demo origin, not `*`.
- PDF text is untrusted data passed to the LLM, never treated as instructions — don't let extracted content alter the system prompt.
- TypeScript strict, zero `any`, zero `console.log` in committed code — use the error/loading states already required by F-06 instead of logging.
- `base: '/<repo>/'` in `vite.config.ts` and `HashRouter` (not `BrowserRouter`) are both required for GitHub Pages routing to work — this is the most common GH Pages footgun, verify both before every deploy.
