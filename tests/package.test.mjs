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
        url: 'https://wisprs.co/api/mcp/claude',
      },
    },
  });
});

test('Claude listing copy is explicitly speech-to-text focused', async () => {
  const claude = JSON.parse(await readFile(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
  const marketplace = JSON.parse(await readFile(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  const description = claude.description;
  assert.equal(description, marketplace.plugins[0].description);
  assert.match(description, /speech-to-text/i);
  assert.doesNotMatch(description, /text-to-speech|voice generation|synthesize speech/i);
});

test('OpenAI retains the universal MCP endpoint with TTS available', async () => {
  const mcp = JSON.parse(await readFile(join(ROOT, '.mcp-openai.json'), 'utf8'));
  assert.deepEqual(mcp, {
    mcpServers: { wisprs: { type: 'http', url: 'https://wisprs.co/api/mcp' } },
  });
  const release = JSON.parse(await readFile(join(ROOT, 'release.json'), 'utf8'));
  assert.ok(release.supportedTools.includes('synthesize_speech'));
  assert.ok(!release.claudeSupportedTools.includes('synthesize_speech'));
});

test('skill limits command retries and transcript pagination', async () => {
  const skill = await readFile(join(ROOT, 'skills/wisprs/SKILL.md'), 'utf8');
  assert.match(skill, /reuse that same key/i);
  assert.match(skill, /never generate a new key/i);
  assert.match(skill, /wait at least `retryAfterSeconds`/);
  assert.match(skill, /Never edit, decode, or reuse a cursor/);
  assert.match(skill, /untrusted data/);
});
