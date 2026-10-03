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

// Evidence is opt-IN. The walk below used to take everything under docs/, so a
// file's presence in the repo was enough to publish it. That held only by
// accident of timing: v0.19.1 was cut hours before the OAuth evidence landed,
// so the published archive happened to contain one evidence file. The next
// build would have shipped an auth-provider instance id, a live OAuth client id,
// internal server paths, and a dated security exception for Dynamic Client
// Registration. A release must never depend on when a file was created.
const publishedEvidence = new Set(
  JSON.parse(await readFile(join(ROOT, 'release.json'), 'utf8')).publishedEvidence ?? []
);

const EVIDENCE_DIR = join(ROOT, 'docs', 'evidence');

function isExcludedEvidence(path, isFile) {
  if (!isFile || !path.startsWith(EVIDENCE_DIR)) return false;

  return !publishedEvidence.has(basename(path));
}

async function files(directory) {
  const result = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name) || entry.name.endsWith('.zip'))
      continue;
    const path = join(directory, entry.name);

    if (isExcludedEvidence(path, entry.isFile())) continue;

    if (entry.isDirectory()) result.push(...(await files(path)));
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

  const digest = createHash('sha256')
    .update(await readFile(archivePath))
    .digest('hex');

  await writeFile(
    join(DIST, `${archiveName}.sha256`),
    `${digest}  ${basename(archivePath)}\n`,
    'utf8'
  );
  await writeFile(join(DIST, 'inventory.txt'), `${stagedFiles.join('\n')}\n`, 'utf8');
  console.log(`${relative(ROOT, archivePath)} ${digest}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
