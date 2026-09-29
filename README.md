# Pavyaa Sri S — Engineering Stories

A dark, responsive portfolio for applied AI and full-stack engineering, with four interactive project demonstrations. The directly implemented neural-network direction uses an oversized typographic identity, an explorable SVG system map and a connected narrative. Built as static HTML, CSS and JavaScript for GitHub Pages.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:8000. The build compiles Tailwind into local CSS; the site does not load a Tailwind runtime or icon library. Google Fonts are optional and have system font fallbacks.

## Pages and behavior

- `index.html`: oversized name and role, four-stage interactive neural visual, pausable signal animation, scroll-linked chapter navigation, four illustrated engineering stories, expandable technical details, resume and demo gallery.
- `ai-evaluator-demo.html`: three sample keyword rubrics, editable responses, criterion breakdowns and JSON export. This is an explainable local simulation, not live AI grading or OCR.
- `biometric-voting-demo.html`: fictional identity verification, candidate selection, review, one-vote protection, updated tally and receipt export. No biometric or government identity integration.
- `lms-demo.html`: course search, lesson progress, assignment submission, faculty grading and an administrator overview using shared sample state.
- `complaint-system-demo.html`: registration, exact-ID tracking, sequential admin status updates, history, filters and export.
- `index_updated.html`: redirects the old portfolio address to the canonical page.

Demo data stays in memory and resets on reload or explicit reset. Attachment selection records only a file name; file contents are never read or uploaded. The public examples are distinct from the production projects described in the case studies. No API keys, analytics, backend or sign-in are required.

## Editing

- Portfolio markup: `index.html`; behavior: `portfolio.js`; styling: `styles/portfolio.css` and `tailwind.config.cjs`.
- Demo shells: the four `*-demo.html` files. Shared styling: `assets/demo.css`; interaction flows: `assets/demo.js`; deterministic state/rubric logic: `assets/demo-core.mjs`.
- Current resume: `output/pdf/Pavyaa_Sri_AI_Engineer_Resume.pdf`. `build_resume.py` regenerates it using ReportLab. The existing root DOCX is retained as a historical source; the site links to the current PDF.

After editing portfolio classes or styles, run `npm run build`. Commit the generated `assets/portfolio.css` with the source changes.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

On Windows the browser tests use installed Google Chrome; on Linux they use Playwright Chromium. Tests cover desktop/tablet/mobile layouts, horizontal overflow, WCAG A/AA checks, the resume, no-JavaScript portfolio navigation, and complete demo workflows. Screenshots and reports are written to ignored `test-results/`.

## Deployment

Pushes to `main` run unit and browser checks, build the public site and deploy `dist/` to GitHub Pages. `scripts/build.mjs` uses an explicit public-file allowlist. Source documents, the offer letter, local tools, tests and design artifacts are not deployed. The `docs/` directory is ignored by Git.

## Design references

Research informed the typography and explanatory approach: [Aristide Benoist typography reference](https://www.opendesign.cc/en/sites/aristide) and [Distill Circuits](https://distill.pub/2020/circuits/). All portfolio diagrams are original illustrations, not live model traces. The network respects reduced motion and stops animating offscreen.
