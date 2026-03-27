#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const strict = process.argv.includes('--strict');

const TARGETS = [
  'src/components/UI',
  'src/layouts',
  'src/styles/global.css',
];

const FILE_EXTENSIONS = new Set(['.css', '.tsx']);

const INLINE_OBJECT_STYLE_PATTERN = /\bstyle=\{\s*\{/;
const HARDCODED_COLOR_PATTERN = /#([0-9a-fA-F]{3,8})\b|rgba?\(/;
const HARDCODED_SPACING_PATTERN = /^\s*(margin|margin-top|margin-right|margin-bottom|margin-left|padding|padding-top|padding-right|padding-bottom|padding-left|gap|row-gap|column-gap)\s*:\s*[^;]*\b\d+(\.\d+)?px\b/;
const HARDCODED_RADIUS_PATTERN = /^\s*border-radius\s*:\s*[^;]*\b\d+(\.\d+)?px\b/;
const HARDCODED_FONT_PATTERN = /^\s*(font-size|line-height)\s*:\s*[^;]*\b\d+(\.\d+)?px\b/;
const HARDCODED_ELEVATION_PATTERN = /^\s*box-shadow\s*:\s*(?!var\(--shadow)[^;]+;/;
const IGNORE_MARKER = 'token-check-ignore';
const INLINE_STYLE_ALLOWLIST = [
  'src/components/UI/Layout/Container.tsx',
  'src/components/UI/Layout/Grid.tsx',
  'src/components/UI/Layout/Stack.tsx',
  'src/components/UI/Skeleton/Skeleton.tsx',
  'src/components/Landing/LandingShared.tsx',
];

/** @type {Array<{file:string, line:number, type:string, text:string}>} */
const findings = [];

function walk(targetPath) {
  const fullPath = path.resolve(ROOT, targetPath);
  if (!fs.existsSync(fullPath)) return;
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(fullPath)) {
      walk(path.join(targetPath, entry));
    }
    return;
  }
  const ext = path.extname(fullPath);
  if (!FILE_EXTENSIONS.has(ext)) return;
  if (fullPath.endsWith('src/styles/tokens/index.css')) return;
  checkFile(fullPath, ext);
}

function checkFile(fullPath, ext) {
  const relative = path.relative(ROOT, fullPath);
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
  const isInlineStyleAllowlisted = INLINE_STYLE_ALLOWLIST.includes(relative);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.includes(IGNORE_MARKER)) continue;

    if (ext === '.tsx' && !isInlineStyleAllowlisted && INLINE_OBJECT_STYLE_PATTERN.test(line)) {
      findings.push({ file: relative, line: i + 1, type: 'inline-style', text: trimmed });
    }

    if (ext === '.css') {
      if (trimmed.startsWith('@media') || trimmed.startsWith('@keyframes')) continue;

      if (HARDCODED_COLOR_PATTERN.test(line) && !trimmed.includes('var(--')) {
        findings.push({ file: relative, line: i + 1, type: 'hardcoded-color', text: trimmed });
      }

      if (HARDCODED_SPACING_PATTERN.test(line) && !trimmed.includes('var(--space-')) {
        findings.push({ file: relative, line: i + 1, type: 'hardcoded-spacing', text: trimmed });
      }

      if (HARDCODED_RADIUS_PATTERN.test(line) && !trimmed.includes('var(--radius-')) {
        findings.push({ file: relative, line: i + 1, type: 'hardcoded-radius', text: trimmed });
      }

      if (HARDCODED_FONT_PATTERN.test(line) && !trimmed.includes('var(--')) {
        findings.push({ file: relative, line: i + 1, type: 'hardcoded-type', text: trimmed });
      }

      if (
        HARDCODED_ELEVATION_PATTERN.test(line) &&
        !trimmed.includes('var(--shadow-') &&
        !trimmed.includes('var(--focus-ring') &&
        !trimmed.includes('none')
      ) {
        findings.push({ file: relative, line: i + 1, type: 'hardcoded-elevation', text: trimmed });
      }
    }
  }
}

for (const target of TARGETS) {
  walk(target);
}

if (findings.length === 0) {
  console.log('Style token check: no findings.');
  process.exit(0);
}

console.log(`Style token check: ${findings.length} finding(s).`);
const grouped = findings.reduce((acc, finding) => {
  acc[finding.type] = (acc[finding.type] || 0) + 1;
  return acc;
}, {});
for (const [type, count] of Object.entries(grouped)) {
  console.log(`  ${type}: ${count}`);
}
for (const f of findings) {
  console.log(`- [${f.type}] ${f.file}:${f.line}  ${f.text}`);
}

if (strict) {
  process.exit(1);
}
