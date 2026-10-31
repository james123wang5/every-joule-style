// 用模板建一本新书：把 skill 里的 template/ 复制到目标文件夹，填上书名和语言。
// 用法：node <skill>/scripts/new-book.mjs <目标文件夹> [--title 书名] [--lang zh|en]
// 目标文件夹必须不存在或为空。复制完后在目标文件夹里运行 npm install、npm run dev。

import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const dest = args.find((a, i) => !a.startsWith('--') && !['--title', '--lang'].includes(args[i - 1]));
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
if (!dest) { console.error('用法：node new-book.mjs <目标文件夹> [--title 书名] [--lang zh|en]'); process.exit(1); }

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'template');
const out = resolve(dest);
if (existsSync(out) && readdirSync(out).length) { console.error(`目标文件夹不是空的：${out}`); process.exit(1); }

const SKIP = new Set(['node_modules', 'dist', 'check-shots', '.DS_Store']);
cpSync(src, out, { recursive: true, filter: (p) => !SKIP.has(p.split(/[\\/]/).pop()) && !p.split(/[\\/]/).pop().startsWith('._') });

const cfgPath = join(out, 'src/content/config.js');
let cfg = readFileSync(cfgPath, 'utf8');
const title = opt('--title'), lang = opt('--lang');
if (title) {
  const q = JSON.stringify(title).slice(1, -1).replace(/'/g, "\\'");
  cfg = cfg.replace(/title: '[^']*'/, `title: '${q}'`).replace(/copyright: '[^']*'/, `copyright: '© ${new Date().getFullYear()} ${q}'`);
}
if (lang) cfg = cfg.replace(/lang: '[^']*'/, `lang: '${lang === 'en' ? 'en' : 'zh'}'`);
writeFileSync(cfgPath, cfg);

const pkgPath = join(out, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = (out.split(/[\\/]/).pop().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'every-joule-style');
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`已建好：${out}
下一步：
  cd "${out}"
  npm install
  npm run dev          # 打开 http://localhost:5173 ，网址加 #3 直接翻到第 3 个跨页
  node tools/check.mjs # 检查内容格式、逐页截图、收集报错`);
