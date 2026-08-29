#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://wisprs.co/api/mcp';
const VERSION = /^(0|[1-9]\d*)$/;
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const SUPPORTED_TOOLS = [
  'transcribe_url',
  'get_private_media_upload_handoff',
  'list_tts_voices',
  'synthesize_speech',
  'list_tts_syntheses',
  'get_tts_audio',
  'list_meeting_sessions',
  'schedule_meeting_capture',
  'cancel_meeting_capture',
  'list_support_tickets',
  'create_support_ticket',
  'list_webhook_endpoints',
  'create_webhook_endpoint',
  'update_webhook_endpoint',
  'delete_webhook_endpoint',
  'list_organization_members',
  'list_creator_packs',
  'list_creator_templates',
  'list_notifications',
  'mark_notifications_read',
  'list_operations',
  'get_job_status',
  'get_transcript',
  'get_transcript_artifact',
  'export_transcript',
  'search_library',
  'list_transcripts',
  'get_transcription_metadata',
  'list_folders',
  'get_usage_and_limits',
  'create_folder',
  'rename_folder',
  'move_transcript_to_folder',
  'delete_folder',
  'rename_transcript',
  'edit_transcript_text',
  'retry_transcription',
  'create_share_link',
  'revoke_share_link',
  'summarize_transcript',
  'generate_chapters',
  'repurpose_transcript',
  'translate_transcript',
  'get_video_transcript',
];
const REQUIRED_FILES = [
  '.claude-plugin/marketplace.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.github/workflows/validate.yml',
  '.mcp.json',
  'CHANGELOG.md',
  'LICENSE',
  'PRIVACY.md',
  'README.md',
  'SECURITY.md',
  'assets/wisprs-icon.png',
  'assets/wisprs-logo.png',
  'docs/ANTHROPIC_SUBMISSION.md',
  'docs/HOST_COMPATIBILITY.md',
  'docs/OPENAI_SUBMISSION.md',
  'docs/REVIEWER_GUIDE.md',
  'docs/RELEASE_PROCESS.md',
  'docs/SUBMISSION_GATES.md',
  'package.json',
  'package-lock.json',
  'release.json',
  'skills/wisprs/SKILL.md',
];

function invariant(condition, message, errors) {
  if (!condition) errors.push(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(join(ROOT, path), 'utf8'));
}

async function sha256(path) {
  return createHash('sha256')
    .update(await readFile(join(ROOT, path)))
    .digest('hex');
}

async function pngDimensions(path) {
  const bytes = await readFile(join(ROOT, path));
  if (bytes.length < 24 || bytes.subarray(1, 4).toString('ascii') !== 'PNG') {
    throw new Error(`${path} is not a PNG`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function walk(directory = ROOT) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'dist' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files.sort();
}

export async function validatePackage() {
  const errors = [];
  const codex = await readJson('.codex-plugin/plugin.json');
  const claude = await readJson('.claude-plugin/plugin.json');
  const marketplace = await readJson('.claude-plugin/marketplace.json');
  const mcp = await readJson('.mcp.json');
  const release = await readJson('release.json');
  const packageJson = await readJson('package.json');
  const skill = await readFile(join(ROOT, 'skills/wisprs/SKILL.md'), 'utf8');

  for (const file of REQUIRED_FILES) {
    try {
      await readFile(join(ROOT, file));
    } catch {
      errors.push(`missing required file: ${file}`);
    }
  }

  const versions = [
    codex.version,
    claude.version,
    marketplace.version,
    release.packageVersion,
    packageJson.version,
  ];
  invariant(
    versions.every((value) => value === versions[0]),
    `version mismatch: ${versions.join(', ')}`,
    errors
  );
  invariant(SEMVER.test(codex.version), 'package version must be strict semantic version', errors);
  invariant(
    VERSION.test(codex.version.split('.')[0]),
    'package major version is malformed',
    errors
  );
  invariant(codex.name === 'wisprs-ai-connectors', 'unexpected Codex plugin name', errors);
  invariant(claude.name === codex.name, 'Claude and Codex plugin names must match', errors);
  invariant(
    marketplace.plugins?.[0]?.name === codex.name,
    'marketplace plugin name must match manifests',
    errors
  );
  invariant(
    marketplace.plugins?.[0]?.source === './',
    'marketplace source must be package root',
    errors
  );
  invariant(codex.mcpServers === './.mcp.json', 'Codex manifest must reference .mcp.json', errors);
  invariant(
    claude.mcpServers === './.mcp.json',
    'Claude manifest must reference .mcp.json',
    errors
  );

  const serverNames = Object.keys(mcp.mcpServers ?? {});
  invariant(
    serverNames.length === 1 && serverNames[0] === 'wisprs',
    'exactly one MCP server named wisprs is required',
    errors
  );
  const server = mcp.mcpServers?.wisprs;
  invariant(server?.type === 'http', 'Wisprs MCP transport must be http', errors);
  invariant(server?.url === ENDPOINT, `Wisprs MCP endpoint must be ${ENDPOINT}`, errors);
  invariant(
    Object.keys(server ?? {}).every((key) => ['type', 'url'].includes(key)),
    'MCP config must not contain headers, credentials, or unsupported fields',
    errors
  );
  invariant(
    release.server?.endpoint === ENDPOINT,
    'release endpoint must match MCP config',
    errors
  );
  invariant(
    release.server?.transport === 'streamable-http',
    'release transport must be streamable-http',
    errors
  );
  invariant(
    release.server?.contractVersion === '1.10.0',
    'release contract version must be 1.10.0',
    errors
  );
  invariant(
    JSON.stringify(release.supportedTools) === JSON.stringify(SUPPORTED_TOOLS),
    'supported tool order/set changed without release review',
    errors
  );

  for (const tool of SUPPORTED_TOOLS) {
    invariant(
      skill.includes(`\`${tool}\``) || skill.includes(tool),
      `skill does not describe supported tool ${tool}`,
      errors
    );
  }
  for (const tool of release.declaredFutureTools ?? []) {
    invariant(
      !skill.includes(`Call \`${tool}\``),
      `skill must not call future tool ${tool}`,
      errors
    );
  }
  invariant(
    skill.includes('untrusted data'),
    'skill must define prompt-injection boundary',
    errors
  );
  invariant(
    skill.includes('idempotencyKey'),
    'skill must define command idempotency behavior',
    errors
  );
  invariant(
    skill.includes('retryAfterSeconds'),
    'skill must define bounded polling behavior',
    errors
  );

  for (const [path, expected] of Object.entries(release.assets ?? {})) {
    invariant((await sha256(path)) === expected, `asset checksum mismatch: ${path}`, errors);
  }
  const icon = await pngDimensions('assets/wisprs-icon.png');
  const logo = await pngDimensions('assets/wisprs-logo.png');
  invariant(icon.width === 128 && icon.height === 128, 'composer icon must be 128x128', errors);
  invariant(logo.width === 512 && logo.height === 512, 'logo must be 512x512', errors);

  const forbiddenPaths = [
    ['/', 'Users', '/'].join(''),
    ['project', '_docs/'].join(''),
    ['src', '/lib/'].join(''),
    ['contabo', '-prod'].join(''),
    ['winter', '-exodus'].join(''),
  ];
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/,
    /gh[opusr]_[A-Za-z0-9]{20,}/,
    /Bearer\s+[A-Za-z0-9._~-]{24,}/i,
  ];
  for (const absolutePath of await walk()) {
    const path = relative(ROOT, absolutePath).split(sep).join('/');
    if (path.endsWith('.png') || path.endsWith('.zip')) continue;
    const contents = await readFile(absolutePath, 'utf8');
    for (const forbidden of forbiddenPaths) {
      invariant(
        !contents.includes(forbidden),
        `${path} contains private implementation reference: ${forbidden}`,
        errors
      );
    }
    invariant(
      !contents.includes(['[', 'TODO', ':'].join('')),
      `${path} contains an unresolved placeholder`,
      errors
    );
    for (const pattern of secretPatterns) {
      invariant(!pattern.test(contents), `${path} appears to contain a secret`, errors);
    }
  }

  return errors;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const errors = await validatePackage();
  if (errors.length > 0) {
    console.error(`Package validation failed (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Package validation passed.');
  }
}
