# PDF Insight

React SPA that extracts text from a user-uploaded PDF, summarizes it, and turns it into structured JSON via an LLM. Ships as static files on GitHub Pages. Recruitment brief: `Brief_Vibe_Coder_PDF_Insight.pdf` (24h deadline, demo must stay live 14 days).

## Architecture

```
Browser (React SPA, GitHub Pages)
  -> POST /api/analyze (FastAPI backend, holds the Gemini key as an env var)
  -> Google Gemini
```

The backend is a **separate repo**, `PDF_INSIGHT_backend` (FastAPI + PyMuPDF for text extraction + Gemini, Dockerized, stateless). This repo (`PDF_INSIGHT_frontend`) has no server-side code at all — the frontend never talks to Gemini directly, only to `VITE_API_URL`. Backend CI/deploy is out of scope here; see that repo for it.

## Repo layout

- `src/` — the Vite/React frontend (see below).
- `public/` — static assets served as-is.
- `AI_LOG.md` — running log of AI-assisted development: tools used, key prompts, where the AI got it wrong and how it was fixed. Update it as you go, don't reconstruct it at the end.
- `.env.example` committed (`VITE_API_URL=http://localhost:8000`, matching the backend's local `uvicorn` port), `.env` gitignored, never committed even historically.

## `src/` structure

| Folder                           | Holds                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/`                           | `analyzeDocument(file)` — the one fetch wrapper calling the backend's `POST /api/analyze`. No direct LLM calls here, only calls to `VITE_API_URL`.                                                                                                                                                                                                                                                   |
| `assets/font/`, `assets/images/` | Static imports bundled by Vite. Currently empty — fonts are self-hosted via `@fontsource*` npm packages instead.                                                                                                                                                                                                                                                                                     |
| `components/common/`             | Reusable, feature-agnostic UI (`Button`, etc).                                                                                                                                                                                                                                                                                                                                                       |
| `components/<feature>/`          | Feature-specific components live directly under `components/`, one folder per feature (`components/upload/`, `components/results/`) — not nested inside `common/`.                                                                                                                                                                                                                                   |
| `constants/`                     | Literal values: `MAX_FILE_SIZE_MB`, `ACCEPTED_MIME_TYPE`.                                                                                                                                                                                                                                                                                                                                            |
| `helpers/`                       | Pure functions with no React/store dependency (e.g. `validateFile`). This is the brief's `lib/` under a project-preferred name — satisfies that structural requirement.                                                                                                                                                                                                                              |
| `hooks/`                         | Global, cross-feature hooks. Feature-local hooks live beside their feature component, not here.                                                                                                                                                                                                                                                                                                      |
| `store/`                         | Zustand store (`analysisStore.ts`) driving the idle/processing/success/error state machine.                                                                                                                                                                                                                                                                                                          |
| `styles/`                        | Single Tailwind entry (`index.css`): `@theme` tokens (paper/highlighter/stamp palette, type, easing, keyframes) plus global base rules. No component-level CSS files — use Tailwind classes.                                                                                                                                                                                                         |
| `types/`                         | Zod schemas as the single source of truth; TS types are `z.infer<typeof Schema>`, never hand-written duplicates. One object per file under `types/documentAnalysis.schema/` (`document.schema.ts`, `entities.schema.ts`, `amount.schema.ts`, `dateEntry.schema.ts`, `documentType.schema.ts`); `types/documentAnalysis.schema.ts` composes them into the top-level schema (section 04 of the brief). |
| `views/`                         | `Home.tsx` — the whole one-pager. No `react-router`: this is a single view with no routes, so it isn't a dependency. If a second view is ever needed (e.g. F-09 history), add it then.                                                                                                                                                                                                               |

Tests are co-located `*.test.ts` next to the file they cover, run by Vitest — no separate `tests/` tree. (Not yet added — still open.)

## Data contract

The Zod schema in `types/documentAnalysis.schema.ts` mirrors the brief's JSON exactly (section 04). Fields may be added, never removed or renamed. Missing information is `null` or `[]` — never fabricated.

The backend already implements the brief's "1 retry then error" rule server-side (bad Gemini response → one internal retry → `502` if it still fails). **The frontend must not also retry** — `api/analyzeDocument.ts` calls the backend exactly once per user action; retrying client-side on top would double the actual retry count and would be actively wrong on a `429`. On any non-2xx response, map it to `{ message, kind }` (`kind: "file"` if the same bytes will fail again — bad PDF, no text layer, oversized, prompt-injection rejection; `kind: "transient"` if retrying the same file is worth it — `429`/`500`/`502`/network failure) and let the UI choose "Wybierz inny plik" vs "Spróbuj ponownie" accordingly. A 200 response still gets parsed through the schema before touching a component, as defense in depth.

## CI/CD

`.github/workflows/deploy.yml`: `lint -> build -> deploy` to GitHub Pages on push to `main`, via `actions/deploy-pages` (Pages source is set to "GitHub Actions" in repo settings, not a branch). Nothing here deploys the backend — that repo ships independently (its own `Dockerfile`).

## Non-negotiables (brief sections 05/06 — violating these disqualifies the submission)

- The Gemini API key lives only in the backend's environment. It must never appear in `src/`, in a client bundle, or anywhere in this repo's git history.
- Backend CORS is restricted to the GitHub Pages demo origin, not `*` (enforced in the backend repo, but worth knowing when debugging a blocked request here).
- PDF text is untrusted data passed to the LLM, never treated as instructions — the backend already delimits it in the system prompt and runs a prompt-injection heuristic; the frontend just needs to keep disclosing this to the user (already does, in `Dropzone.tsx`).
- TypeScript strict, zero `any`, zero `console.log` in committed code — use the error/loading states already required by F-06 instead of logging. (`"strict": true` is not yet turned on in `tsconfig.app.json`/`tsconfig.node.json` — still open.)
- `base: '/PDF_INSIGHT_frontend/'` in `vite.config.ts` must match this repo's exact name — this is the most common GH Pages footgun, verify it hasn't drifted before every deploy (it already has, twice, from repo renames).
