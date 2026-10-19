import {defineConfig} from 'vite';
import {resolve,basename} from 'node:path';
import {readdirSync} from 'node:fs';
// Include every existing root HTML page, preserving previously installed extensions.
const input=Object.fromEntries(readdirSync('.').filter(name=>name.endsWith('.html')).map(name=>[basename(name,'.html'),resolve(name)]));
export default defineConfig({base:'./',build:{rollupOptions:{input}}});
