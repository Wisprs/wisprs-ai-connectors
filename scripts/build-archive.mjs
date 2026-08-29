#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const version = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8')).version;
const archiveName = `wisprs-ai-connectors-v${version}.zip`;
const archivePath = join(DIST, archiveName);
const epoch = new Date('2026-01-01T00:00:00Z');

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name) || entry.name.endsWith('.zip')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
const temp = await mkdtemp(join(tmpdir(), 'wisprs-plugin-'));
const stage = join(temp, 'wisprs-ai-connectors');
await mkdir(stage);

try {
  for (const source of await files(ROOT)) {
    const destination = join(stage, relative(ROOT, source));
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination);
    await utimes(destination, epoch, epoch);
  }
  const stagedFiles = (await files(stage)).map((path) => relative(stage, path));
  const zip = spawnSync('zip', ['-X', '-q', archivePath, ...stagedFiles], {
    cwd: stage,
    encoding: 'utf8',
  });
  if (zip.status !== 0) throw new Error(zip.stderr || 'zip command failed');
  const digest = createHash('sha256').update(await readFile(archivePath)).digest('hex');
  await writeFile(join(DIST, `${archiveName}.sha256`), `${digest}  ${basename(archivePath)}\n`, 'utf8');
  await writeFile(join(DIST, 'inventory.txt'), `${stagedFiles.join('\n')}\n`, 'utf8');
  console.log(`${relative(ROOT, archivePath)} ${digest}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
