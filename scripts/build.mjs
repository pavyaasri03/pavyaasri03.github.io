import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// An explicit allowlist keeps source documents and design tooling off the public site.
const files = [
  'index.html', 'index_updated.html', '404.html',
  'ai-evaluator-demo.html', 'biometric-voting-demo.html', 'lms-demo.html', 'complaint-system-demo.html',
  'portfolio.js', 'assets/portfolio.css', 'assets/demo.css', 'assets/demo.js', 'assets/demo-core.mjs',
  'output/pdf/Pavyaa_Sri_Res.pdf'
];
for (const file of files) {
  await mkdir(dirname(`dist/${file}`), { recursive: true });
  await copyFile(file, `dist/${file}`);
}
await writeFile('dist/.nojekyll', '');
console.log(`Built ${files.length} public files in dist/.`);
