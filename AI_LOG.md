# AI_LOG

## Tools

- **Claude Code** (Anthropic CLI, model Claude Sonnet 5) — primary tool for the whole frontend: scaffolding, component/store/schema code, debugging, CI/CD setup via `gh`, and this log.
- Two of Claude Code's built-in **skills** were invoked for the UI pass: `emil-design-eng` (animation/interaction-design rules — easing curves, press feedback, when _not_ to animate) and `frontend-design` (forced an actual visual concept instead of a generic AI-default layout — see the "paper & highlighter" direction in the README).
- `grill-with-docs` — used while writing the first `CLAUDE.md`, to stress-test the proposed folder structure and conventions before any code was built on top of them.

## Key prompts

1. _"let's write together a Claude.md, what is very important is that the structure looks like this src/... if you believe i need anything else tell me"_ — set the folder conventions (`components/common` vs feature folders, Zod-in-`types/`, no CSS files) before any code existed, so everything after had a shape to fit into.
2. _"/frontend-design now create a website for it, no logging in, just one pager"_ — kicked off the actual build. Deliberately asked for a design pass first rather than "just make it work," which is why the UI isn't a generic form.
3. _"the whole pdf extraction is on backend, let's work on public demo, how would you start"_ — a real architecture pivot: text extraction moved server-side, which simplified the frontend (no `pdf.js`, no worker file) and is when the GitHub Pages deploy pipeline got built.
4. _"each type should be in it's own separate file, that's why we have a types folder, as to prevent such things from happening"_ — pushed a stricter split of `types/` than I'd initially set up (one object per file), which is now the actual convention documented in `CLAUDE.md`.

## Where the AI got it wrong

- **Shipped a bug that crashed the app in production.** `ErrorStamp.tsx`'s Zustand selector returned a brand-new object literal on every call (`useAnalysisStore((state) => ({ ...four fields }))`). Under `useSyncExternalStore`, that reads as "the store changed" on every render check, which sends React into an infinite re-render loop. It never showed up in casual testing because no error had actually been triggered yet — the first time it fired for real (a 502 from an image-only PDF), the whole page crashed instead of showing the error stamp. Fixed by selecting each field individually, matching the pattern already used correctly everywhere else in the codebase. I only found the actual cause by reading the minified React error code and reasoning through _why_ a selector would be unstable, not by guessing.

I've read and understood every line that ended up in the repo, including tracing through why each of the above bugs actually happened rather than just accepting the fix that made the symptom go away.
