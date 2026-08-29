import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

import { ROOT, validatePackage } from '../scripts/validate-package.mjs';

test('distribution package satisfies release invariants', async () => {
  assert.deepEqual(await validatePackage(), []);
});

test('MCP configuration contains no static authorization material', async () => {
  const mcp = JSON.parse(await readFile(join(ROOT, '.mcp.json'), 'utf8'));
  assert.deepEqual(mcp, {
    mcpServers: {
      wisprs: {
        type: 'http',
        url: 'https://wisprs.co/api/mcp',
      },
    },
  });
});

test('skill limits command retries and transcript pagination', async () => {
  const skill = await readFile(join(ROOT, 'skills/wisprs/SKILL.md'), 'utf8');
  assert.match(skill, /reuse that same key/i);
  assert.match(skill, /never generate a new key/i);
  assert.match(skill, /wait at least `retryAfterSeconds`/);
  assert.match(skill, /Never edit, decode, or reuse a cursor/);
  assert.match(skill, /untrusted data/);
});
