# Pavyaa Sri S — Intelligence, engineered

A spatial portfolio for applied AI and full-stack engineering. An original Three.js environment connects four project stories through five reflective sculptures, with an oversized typographic introduction and an explorable project constellation.

## Local preview

Requires Node.js 22 or later.

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:8000. Set `PORT` to use another port. The server serves `dist/`; rebuild after editing source files.

## Experience

- Scroll through source-grounded assessment, multilingual speech, marketing intelligence and role-aware scheduling. The 3D scene changes with the active story.
- Drag the hero sculpture to rotate it. **Explore in 3D** opens the project constellation: drag to orbit, scroll/pinch to zoom, and select a sculpture or a labelled project button.
- Explorer controls provide keyboard-accessible rotation, zoom and reset. Arrow keys rotate; `+`/`-` zoom. Escape returns to the story. Project dialogs also support Escape.
- Pause motion at any time. Reduced-motion preferences remove ambient animation and smooth transitions. Rendering stops in a background tab. WebGL failure leaves a CSS illustration and the complete readable portfolio.
- All sculptures are procedural geometry. No external models, textures, AI API, analytics or sign-in are required. The shapes illustrate the stories; they are not live neural-network traces.
- Google Fonts are optional, with system fallbacks. Three.js is bundled locally, so the 3D experience does not depend on a CDN.

## Existing demos

- `ai-evaluator-demo.html`: three keyword rubrics, editable responses, criterion breakdowns and JSON export. A local simulation, not live AI grading or OCR.
- `biometric-voting-demo.html`: fictional verification, ballot review, one-vote protection, tally and receipt. No biometric or government-identity integration.
- `lms-demo.html`: course search, lesson progress, submission, faculty grading and shared administrative state.
- `complaint-system-demo.html`: registration, exact-ID tracking, sequential status updates, history, filters and export.

Sample data resets on reload or explicit reset. Attachments record only the selected filename; file contents are never read or uploaded. These examples are separate from the work products described in the portfolio.

## Source files

- `index.html`: semantic portfolio content, explorer controls and project dialog.
- `src/portfolio.js`: navigation, explorer state, focus management, project content and motion controls.
- `src/scene.js`: Three.js geometry, environment lighting, camera, picking, animation and scroll composition.
- `styles/portfolio.css`: responsive layout, visual tokens and CSS motion.
- `scripts/bundle.mjs`: esbuild output to `portfolio.js`. Do not edit that generated bundle manually.
- `assets/portfolio.css`: generated CSS. `assets/demo.css`, `assets/demo.js` and `assets/demo-core.mjs` support the standalone demos.
- `output/pdf/Pavyaa_Sri_Res.pdf`: current downloadable resume. `build_resume.py` regenerates it; the historical root DOCX is not published.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run test:spatial
```

Windows uses installed Google Chrome; Linux uses Playwright Chromium. Headless checks enable software WebGL. Tests cover layouts, accessibility, links, no-JavaScript reading, demo workflows, real 3D rendering, pause/resume, drag, scroll stages, explorer controls, mesh picking, dialogs and WebGL failure. Screenshots and reports are written to ignored `test-results/`.

## Publishing

The existing GitHub Pages workflow builds and checks pushes to `main`, then deploys `dist/`. Building locally does not publish anything. `scripts/build.mjs` explicitly selects public files; private documents, source notes, local tools and design artifacts are excluded.

## Visual research

Pinterest references included [animated 3D portfolios](https://in.pinterest.com/pin/create-a-stunning-3d-animated-portfolio-website-with-nextjs-threejs-gsap-and-prismic--597712181828138943/), [reflective chrome spheres](https://in.pinterest.com/pin/crystal-sphere-chrome-ball-design--3025924740936969/) and [3D website compositions](https://in.pinterest.com/pin/950400327635001563/). They informed material and motion direction; all scene geometry and composition here were authored for this portfolio. Three.js is MIT licensed; its notice is retained in the generated bundle.
