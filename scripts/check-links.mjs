#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = process.argv.includes('--live');
const EXTERNAL = new Set();
const errors = [];

async function markdownFiles(directory = ROOT) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

for (const file of await markdownFiles()) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, '');
    if (raw.startsWith('https://')) {
      EXTERNAL.add(raw.split('#')[0]);
      continue;
    }
    if (/^[a-z]+:/i.test(raw) || raw.startsWith('#')) continue;
    const local = resolve(dirname(file), decodeURIComponent(raw.split('#')[0]));
    if (!local.startsWith(`${ROOT}/`) && local !== ROOT) {
      errors.push(`${relative(ROOT, file)} links outside package: ${raw}`);
      continue;
    }
    try {
      await access(local);
    } catch {
      errors.push(`${relative(ROOT, file)} has broken local link: ${raw}`);
    }
  }
}

if (LIVE) {
  for (const url of [...EXTERNAL].sort()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
      if (response.status === 405 || response.status === 403) {
        response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
      }
      if (!response.ok) errors.push(`external link returned ${response.status}: ${url}`);
    } catch (error) {
      errors.push(`external link failed: ${url} (${error instanceof Error ? error.message : 'unknown error'})`);
    } finally {
      clearTimeout(timeout);
    }
  }
}

if (errors.length > 0) {
  console.error(`Link validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Link validation passed (${EXTERNAL.size} external URLs${LIVE ? ', checked live' : ', syntax only'}).`);
}
