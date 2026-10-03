#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const ENDPOINT = 'https://wisprs.co/api/mcp';

const CLAUDE_ENDPOINT = 'https://wisprs.co/api/mcp/claude';

const CLAUDE_EXCLUDED_TOOLS = [
  'list_tts_voices',
  'synthesize_speech',
  'list_tts_syntheses',
  'get_tts_audio',
];

const CLAUDE_SUPPORTED_TOOLS = [
  'transcribe_url',
  'get_private_media_upload_handoff',
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
];

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
];

const REQUIRED_FILES = [
  '.claude-plugin/marketplace.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.github/workflows/validate.yml',
  '.mcp.json',
  '.mcp-openai.json',
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
  const openaiMcp = await readJson('.mcp-openai.json');
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
  invariant(
    codex.mcpServers === './.mcp-openai.json',
    'Codex manifest must reference .mcp-openai.json',
    errors
  );
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
  invariant(
    server?.url === CLAUDE_ENDPOINT,
    `Claude MCP endpoint must be ${CLAUDE_ENDPOINT}`,
    errors
  );
  invariant(
    Object.keys(server ?? {}).every((key) => ['type', 'url'].includes(key)),
    'MCP config must not contain headers, credentials, or unsupported fields',
    errors
  );
  invariant(
    release.server?.endpoint === ENDPOINT,
    'release universal endpoint must match OpenAI config',
    errors
  );
  invariant(
    openaiMcp.mcpServers?.wisprs?.type === 'http' &&
      openaiMcp.mcpServers?.wisprs?.url === ENDPOINT &&
      Object.keys(openaiMcp.mcpServers ?? {}).length === 1 &&
      Object.keys(openaiMcp.mcpServers.wisprs).every((key) => ['type', 'url'].includes(key)),
    'OpenAI config must contain only the canonical HTTPS endpoint',
    errors
  );
  invariant(
    release.server?.claudeEndpoint === CLAUDE_ENDPOINT,
    'release Claude endpoint mismatch',
    errors
  );
  invariant(
    release.server?.transport === 'streamable-http',
    'release transport must be streamable-http',
    errors
  );
  invariant(
    release.server?.contractVersion === '1.14.0',
    'release contract version must be 1.14.0',
    errors
  );
  invariant(
    JSON.stringify(release.supportedTools) === JSON.stringify(SUPPORTED_TOOLS),
    'supported tool order/set changed without release review',
    errors
  );

  const claudeTools = CLAUDE_SUPPORTED_TOOLS;
  invariant(
    JSON.stringify(release.claudeSupportedTools) === JSON.stringify(CLAUDE_SUPPORTED_TOOLS),
    'Claude supported tool order/set changed without release review',
    errors
  );
  invariant(
    JSON.stringify(SUPPORTED_TOOLS.filter((tool) => !CLAUDE_SUPPORTED_TOOLS.includes(tool))) ===
      JSON.stringify(CLAUDE_EXCLUDED_TOOLS),
    'every universal tool omitted from Claude must be explicitly reviewed',
    errors
  );

  for (const tool of CLAUDE_EXCLUDED_TOOLS) {
    invariant(
      !skill.includes(`\`${tool}\``),
      `Claude skill must not instruct use of ${tool}`,
      errors
    );
  }

  for (const tool of claudeTools) {
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

  // Blocked terms are stored encoded so that this file, which ships in the
  // archive, never itself contains a fragment of anything it exists to keep
  // out. A previous version listed a hosting provider split across two string
  // literals; the first half still named the provider.
  const decode = (value) => Buffer.from(value, 'base64').toString('utf8');

  const forbiddenPaths = [
    decode('L1VzZXJzLw=='),
    decode('cHJvamVjdF9kb2NzLw=='),
    decode('c3JjL2xpYi8='),
    decode('Y29udGFiby1wcm9k'),
    decode('d2ludGVyLWV4b2R1cw=='),
    decode('L29wdC9hcHBzLw=='),
    decode('L2V0Yy93aXNwcnMv'),
  ];

  // Infrastructure and vendor names that identify how the service is hosted or
  // built. Reviewer evidence does not need them, and a public archive must not
  // advertise them. Matched case-insensitively.
  const forbiddenInfraTerms = [
    decode('Y29udGFibw=='),
    decode('YXR0ZW5kZWU='),
    decode('c3lzdGVtZA=='),
    decode('dGFpbHNjYWxl'),
    decode('aGV0em5lcg=='),
    decode('ZGlnaXRhbG9jZWFu'),
    decode('UlVOVElNRV9DT05UUk9MX0JMT0NLRUQ='),
  ];

  // Live third-party and tenant identifiers. Not secrets on their own, but they
  // name real production objects and belong in reviewer channels, not a public
  // archive.
  const forbiddenIdentifiers = [
    { label: 'auth-provider instance id', pattern: /\bins_[A-Za-z0-9]{20,}\b/ },
    { label: 'MCP OAuth client id', pattern: /\bclient(?:_i|I)d[`'"\s:=]+[A-Za-z0-9]{16}\b/ },
  ];

  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/,
    /gh[opusr]_[A-Za-z0-9]{20,}/,
    /Bearer\s+[A-Za-z0-9._~-]{24,}/i,
  ];

  // Evidence that release.json does not publish never enters the archive, so it
  // is deliberately exempt from the content rules below: internal records are
  // allowed to name internal things. The publish list is the security boundary,
  // and build-archive.mjs reads the same list.
  const publishedEvidence = new Set(
    JSON.parse(await readFile(join(ROOT, 'release.json'), 'utf8')).publishedEvidence ?? []
  );

  const shipsInArchive = (path) =>
    !path.startsWith('docs/evidence/') || publishedEvidence.has(path.split('/').pop());

  for (const absolutePath of await walk()) {
    const path = relative(ROOT, absolutePath).split(sep).join('/');

    if (path.endsWith('.png') || path.endsWith('.zip')) continue;

    if (!shipsInArchive(path)) continue;
    const contents = await readFile(absolutePath, 'utf8');

    for (const forbidden of forbiddenPaths) {
      invariant(
        !contents.includes(forbidden),
        `${path} contains private implementation reference: ${forbidden}`,
        errors
      );
    }

    const lowered = contents.toLowerCase();

    for (const term of forbiddenInfraTerms) {
      invariant(
        !lowered.includes(term.toLowerCase()),
        `${path} names infrastructure or a vendor that must not ship: ${term}`,
        errors
      );
    }

    for (const { label, pattern } of forbiddenIdentifiers) {
      invariant(!pattern.test(contents), `${path} contains a live ${label}`, errors);
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
