# Wisprs AI Connectors

Official Wisprs distribution package for ChatGPT, Codex, Claude Code, and remote MCP clients. The authenticated Streamable HTTP endpoints are:

- Claude connector and plugin: `https://wisprs.co/api/mcp/claude` (STT and other non-TTS workflows; 39 tools).
- ChatGPT, Codex, and other direct MCP clients: `https://wisprs.co/api/mcp` (universal surface; 43 tools, including TTS).
- Browser setup guide: `https://wisprs.co/mcp/setup`.

The Claude release supports transcript, library, meeting, creator, support, and developer workflows:

- `transcribe_url` starts an asynchronous transcription from a public HTTPS media URL.
- `get_private_media_upload_handoff` opens the authenticated Wisprs uploader for local or private media without sending file bytes or upload tokens through the model.
- `get_job_status` checks the durable operation without creating duplicate work.
- `get_transcript` retrieves a completed transcript in bounded, cursor-based pages.
- `get_transcript_artifact` retrieves generated content in bounded pages.
- `search_library` finds ranked moments in the connected tenant's library.
- `export_transcript` creates TXT, SRT, VTT, JSON, Markdown, or DOCX as a private expiring MCP resource.
- `summarize_transcript` and `generate_chapters` create reusable structured artifacts.
- `repurpose_transcript` creates show notes, threads, blog drafts, or quote selections.
- `translate_transcript` creates a reusable language-specific artifact.

The server owns authentication, authorization, tenant isolation, idempotency, rate limits, cost controls, audit records, and data retention. This repository contains no Wisprs service source code, credentials, or customer data.

## Install for Claude Code

Test a local checkout:

```bash
claude --plugin-dir ./wisprs-ai-connectors
```

Or add the public repository as a marketplace after it is published:

```text
/plugin marketplace add Wisprs/wisprs-ai-connectors
/plugin install wisprs-ai-connectors@wisprs-plugins
```

In Claude Code, run its `/mcp` command to complete OAuth in the browser. Do not paste tokens into the repository, prompts, or configuration files.

## Install for ChatGPT and Codex

The `.codex-plugin/plugin.json` manifest uses `.mcp-openai.json` and the universal endpoint. During private testing, register `https://wisprs.co/api/mcp` in ChatGPT developer mode, then associate the resulting connection with this package. Public discovery requires separate OpenAI review; the presence of this package does not imply marketplace approval.

## Direct MCP configuration

Claude hosts use the checked-in `.mcp.json`. Other hosts can use `.mcp-openai.json` for the universal endpoint. Each endpoint returns OAuth protected-resource metadata and drives browser authorization. Static bearer tokens are neither required nor accepted in this package.

## Correct asynchronous usage

1. Tell the user that transcription starts billable asynchronous work and obtain confirmation when the host has not already done so.
2. Generate one opaque idempotency key for the logical request.
3. Call `transcribe_url` once and retain its `operationId`.
4. Poll `get_job_status` no faster than `retryAfterSeconds`.
5. After `completed`, use the returned opaque `transcriptionId` with `get_transcript`.
6. Follow `nextCursor` exactly and state when the response is partial.

For exports and AI transformations, use one stable idempotency key, poll the returned operation, then read the exact export resource URI or call `get_transcript_artifact` with the completed result metadata. Never place a large export directly into conversation context when the MCP resource is available.

Never retry an ambiguous `transcribe_url` call with a new idempotency key. That can create duplicate billable work.

## Development

Requirements: Node.js 22 or newer and, for host validation, current Claude Code and Codex tooling.

```bash
npm test
npm run validate
npm run package
```

`npm run validate:live-links` additionally verifies public policy and support links over HTTPS. Host-specific test cases and release gates are in [docs/HOST_COMPATIBILITY.md](docs/HOST_COMPATIBILITY.md) and [docs/REVIEWER_GUIDE.md](docs/REVIEWER_GUIDE.md).

## Security and privacy

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability and [PRIVACY.md](PRIVACY.md) for the package's data boundaries. The service policies are published at [wisprs.co/privacy](https://wisprs.co/privacy) and [wisprs.co/terms](https://wisprs.co/terms).

## Release status

Version `0.27.0` is a pre-submission package. No OpenAI or Anthropic approval is claimed. See [CHANGELOG.md](CHANGELOG.md) and [release.json](release.json) for compatibility and provenance.

## License

MIT. See [LICENSE](LICENSE).
