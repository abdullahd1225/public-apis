/**
 * Kod tabanının modül bağımlılık grafiğini çıkarır (import ilişkileri).
 * Çıktı: docs/MIMARI_GRAF.md (Mermaid diyagramı + düğüm/kenar listesi)
 * Kullanım: node scripts/graph.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dirs = ['server/src', 'client/src'];
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(js|jsx|mjs)$/.test(e.name)) files.push(p);
});
dirs.forEach((d) => walk(path.join(root, d)));

const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const id = (p) => rel(p).replace(/[^a-zA-Z0-9]/g, '_');
const edges = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/import\s+[^'"]*?['"](\.[^'"]+)['"]/g)) {
    const target = path.resolve(path.dirname(f), m[1]);
    if (files.includes(target)) edges.push([f, target]);
  }
}
const group = (f) => rel(f).split('/').slice(0, 3).join('/');
const groups = [...new Set(files.map(group))];
let out = '# Mimari Bağımlılık Grafiği\n\n> Bu dosya `node scripts/graph.mjs` ile otomatik üretilir.\n\n';
out += `Toplam dosya: **${files.length}**, import ilişkisi: **${edges.length}**\n\n`;
out += '```mermaid\nflowchart LR\n';
for (const g of groups) {
  out += `  subgraph ${g.replace(/[^a-zA-Z0-9]/g, '_')}["${g}"]\n`;
  files.filter((f) => group(f) === g).forEach((f) => (out += `    ${id(f)}["${path.basename(f)}"]\n`));
  out += '  end\n';
}
edges.forEach(([a, b]) => (out += `  ${id(a)} --> ${id(b)}\n`));
out += '```\n\n## En çok bağımlılık alan dosyalar\n\n| Dosya | Kaç dosya kullanıyor |\n|---|---|\n';
const inbound = {};
edges.forEach(([, b]) => (inbound[rel(b)] = (inbound[rel(b)] || 0) + 1));
Object.entries(inbound).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([f, n]) => (out += `| \`${f}\` | ${n} |\n`));
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/MIMARI_GRAF.md'), out);
console.log(`docs/MIMARI_GRAF.md yazıldı (${files.length} dosya, ${edges.length} ilişki)`);
