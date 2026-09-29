import {build} from 'esbuild';
// Escaped shader strings avoid noisy multiline whitespace in the generated asset.
await build({entryPoints:['src/portfolio.js'],outfile:'portfolio.js',bundle:true,minify:true,format:'iife',target:['es2022'],supported:{'template-literal':false},legalComments:'eof'});
console.log('Bundled local Three.js scene and portfolio interactions.');
