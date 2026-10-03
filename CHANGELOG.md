# Changelog

All notable package changes are documented here. Versions follow Semantic Versioning.

## [Unreleased]

- Platform review, production compatibility certification, and signed release tag remain gated.

## [0.28.3] - 2026-10-03

### Added

- Claude plugin manifest: `displayName` ("Wisprs") and the directory listing fields `documentationUrl`, `supportUrl`, `privacyPolicyUrl` and `termsOfServiceUrl`, all documented in the Claude Code plugin manifest reference. The listing icon stays the default plugin-folder icon file.

## [0.28.2] - 2026-10-03

### Fixed

- Removed `icon` and `privacyPolicyUrl` from `.claude-plugin/plugin.json`; the Claude directory flags both as unrecognized. The icon file stays in the plugin folder, and the privacy policy URL is taken from the README.

## [0.28.1] - 2026-10-03

### Added

- Claude plugin icon: a 512x512 Wisprs mark in the plugin folder, which the Claude directory reads as the listing icon. (An explicit `icon` and `privacyPolicyUrl` in the manifest were tried and removed in 0.28.2: the directory treats them as unrecognized fields.)

## [0.28.0] - 2026-10-03

### Changed

- Server contract `1.16.0`. The tools that reach outside Wisprs name the API docs they use: `transcribe_url` links the transcription jobs API (https://wisprs.co/developer/docs/jobs), and `create_webhook_endpoint` and `update_webhook_endpoint` link the webhooks API (https://wisprs.co/developer/docs/webhooks). Names, schemas, scopes and annotations are unchanged.

## [0.27.0] - 2026-10-03

### Changed

- Server contract `1.15.0`. Six tool descriptions now state only what the tool does, with no references to other tools and no instructions to the model: `transcribe_url`, `get_job_status`, `get_transcript`, `list_transcripts`, `create_folder`, `create_support_ticket`. Tool names, input and output schemas, scopes and annotations are unchanged, so existing connections keep working.
- Every tool now carries `annotations.title` (server-side), which directory checkers read in addition to the top-level title.

## [0.26.0] - 2026-10-03

### Fixed

- The Claude package now connects to `https://wisprs.co/api/mcp/claude`, the Claude-only surface (39 tools, no text-to-speech, writes marked destructive). `https://wisprs.co/mcp` serves the universal surface (43 tools including the four TTS tools) and advertises the universal OAuth resource, so the previous Claude configuration exposed tools the Claude directory restricts and named an OAuth resource that did not match its URL. The OpenAI and Codex endpoint (`https://wisprs.co/api/mcp`) is unchanged.

## [0.25.2] - 2026-10-03

### Changed

- Release notes no longer promise a confirmation before every write. ChatGPT decides when to ask; the notes now say write and billable tools are marked so ChatGPT can confirm them first, matching the review test cases ("may ask for confirmation").

## [0.25.1] - 2026-10-03

### Added

- OpenAI review demo video (`review.demo_recording_url`, unlisted YouTube): the reviewer account running the review cases in ChatGPT.

### Changed

- Review test cases match the web dry run: `tools_triggered` lists the `search_library` lookups ChatGPT makes, the summary case asks Wisprs to generate and save the summary, and the folder case uses a folder name that has never been created on the reviewer account.

## [0.25.0] - 2026-10-03

### Removed

- `get_video_transcript` is no longer advertised or callable on either MCP endpoint (universal 43 tools, Claude 39). It reads YouTube, TikTok and Instagram captions without an official platform API, which directory guidelines treat as unauthorized scraping. Transcription of direct public HTTPS media through `transcribe_url` is unchanged, and the skill no longer suggests the caption tool. The server contract still defines it; the server simply does not expose it.

## [0.24.0] - 2026-10-03

### Changed

- Pinned server contract updated to `1.14.0`, from the OpenAI portal's MCP tool scan:
  - `create_support_ticket` now carries `openWorldHint: true`. A ticket is delivered to the Wisprs support team, people outside the user's own workspace, so the tool reaches beyond the caller's data.
  - `get_video_transcript` is retitled "Get video captions" and its description drops "instantly" and "free". It states what the tool does: it returns an existing caption track, runs no speech-to-text, uses no minutes, and returns `no_captions` when there is none.

## [0.23.2] - 2026-10-03

### Changed

- OpenAI listing fixes from the portal's upload checks: short description shortened to 30 characters or fewer, starter prompts trimmed to three, and `interface.supportURL` added (`https://wisprs.co/contact`).

## [0.23.1] - 2026-10-03

### Changed

- OpenAI listing developer name is now `AEY Group LTD`, the business verified on the publishing OpenAI organization. Product name, endpoints and contract are unchanged.

## [0.23.0] - 2026-10-03

### Added

- Pinned server contract updated to `1.13.0`. A completed `export_transcript` download now also carries an optional `downloadUrl`: a signed `https` link to the same export, valid until `expiresAt`. Hosts that cannot read MCP resources (ChatGPT showed `wisprs://exports/...` as plain text) can give users a link that opens. The signature binds the export, its owner and the expiry, so the link cannot be retargeted or extended.

### Changed

- `QUOTA_EXCEEDED` now reads "This action is not included in the Wisprs account's plan, or its quota is used up." It is also returned when a plan does not include a tool's feature (for example library search on the free plan), and the old "not enough remaining quota" wording was misleading in that case. The code and retry semantics are unchanged.

### Fixed

- `get_job_status` settles a transcription operation as soon as its transcript is finished, instead of reporting `running` for up to a minute until the scheduled reconciler ran.
- Transcript segments built from word-level timings no longer contain doubled spaces between words.

## [0.22.0] - 2026-10-03

### Changed

- Pinned server contract updated to `1.12.0`: every tool that creates, changes or deletes data, or starts billable work, now carries `destructiveHint: true` (23 write tools; reads unchanged). Under ChatGPT's default "Allow low-risk tools" permission, `transcribe_url` and other billable tools ran without a confirmation prompt while they were marked non-destructive. Hosts now ask before every write, as the reviewer guide's P1 requires.

### Fixed

- `get_transcript` returned `NOT_FOUND` for a completed transcript with no speech (music or silence). It now returns a normal page with zero segments; `NOT_FOUND` is reserved for transcripts that do not exist or are not the caller's.

## [0.21.0] - 2026-09-27

### Changed

- Added a dedicated Claude MCP endpoint that advertises 40 non-TTS tools and rejects direct calls to excluded TTS tools. The universal endpoint retains all 44 tools for other hosts.
- Claude package validation now pins its reviewed tool allowlist and rejects unreviewed universal-surface additions; MCP contract tests enforce tool-name limits and Claude read/write safety annotations. The Claude video-caption description no longer suggests an automatic billable STT fallback.
- Claude's plugin and marketplace listing copy now explicitly describes the speech-to-text surface; reviewer guidance spells out the read-only versus confirmation-triggering write annotations.
- Claude plugin configuration now targets the canonical STT-focused endpoint at `https://wisprs.co/mcp`; the browser guide lives at `/mcp/setup`, and the earlier `/api/mcp/claude` path remains a compatibility alias with its own OAuth audience. OpenAI configuration continues to target the universal endpoint at `/api/mcp`.
- Directory submission and reviewer materials now distinguish the two host surfaces. This package remains pre-submission; production and real-host certification are still required.

## [0.20.0] - 2026-09-01

### Fixed

- Completed webhook operations could never be polled. `get_job_status` validates its result against the operation-result union, which had no `webhook-mutation` member even though the worker stores exactly that, so every completed `create_webhook_endpoint`, `update_webhook_endpoint` and `delete_webhook_endpoint` returned `INTERNAL`. The mutations applied correctly, but the signing secret is returned only in the completed result and was therefore unreachable. Found during the first production execution of the write path.

### Added

- Pinned server contract updated to `1.11.0` with a `webhook-mutation` result kind, discriminated on `action` (`endpoint-created`, `endpoint-updated`, `endpoint-disabled`) to match the existing library and share mutation shapes.
- New `ROLLOUT_DENIED` error code for a connection that is not enabled for the current rollout state or cohort. It is non-retryable: the previous `DEPENDENCY_UNAVAILABLE` is retryable, so hosts backed off and retried a denial that could never succeed. The specific reason is deliberately not exposed to hosts and is recorded server-side instead.

### Changed

- `contractSha256` is now the SHA-256 of the canonical JSON serialization of the contract snapshot, the same value pinned by the server-side snapshot test. The previous value was not reproducible from any published artifact.

## [0.19.1] - 2026-08-29

### Fixed

- CI archive secret scan no longer self-matches its own detection patterns.

## [0.19.0] - 2026-08-29

### Added

- Skill coverage and validation for the webhook mutation tools (`create_webhook_endpoint`, `update_webhook_endpoint`, `delete_webhook_endpoint`) and the free caption tool (`get_video_transcript`).

### Changed

- Pinned server contract updated to `1.10.0` (44 tools) with the current contract snapshot digest.
- Rebuilt the deterministic archive at the package version, replacing the stale `v0.2.0` artifact.

## [0.18.0] - 2026-08-25

### Added

- Durable, consent-attested meeting scheduling and cancellation operations.

## [0.17.0] - 2026-08-25

### Added

- Tenant-bound notification listing and mark-read controls.

## [0.16.0] - 2026-08-25

### Added

- Short-lived tenant-authorized TTS audio delivery via `get_tts_audio`.

## [0.15.0] - 2026-08-25

### Added

- Read-only creator pack and workflow template discovery.

## [0.14.0] - 2026-08-25

### Added

- Tenant-bound support ticket listing and creation with bounded content and opaque ticket handles.
- Redacted webhook endpoint inventory and workspace member inventory for developer and organization workflows.
- Additive least-privilege scopes for support, webhooks, meetings, and organization reads.

## [0.13.0] - 2026-08-25

### Added

- Durable `synthesize_speech` operation with plan-aware opaque voice authorization, provider execution, storage persistence, quota checks, and replay detection.

## [0.12.0] - 2026-08-25

### Added

- Read-only `list_operations` diagnostics with tenant-bound, payload-free history and stable retry/error metadata.

## [0.11.0] - 2026-08-25

### Added

- Read-only `list_meeting_sessions` with tenant-bound status and consent metadata.
- Contract 1.9.0 meeting-read scope and local Inspector fixture coverage.

## [0.10.0] - 2026-08-25

### Added

- Read-only `list_tts_syntheses` history with tenant-scoped opaque synthesis handles and bounded untrusted previews.
- Contract 1.9.0 compatibility evidence for the D25 TTS history surface.

## [0.9.0] - 2026-08-25

### Added

- Read-only `list_tts_voices` with plan-aware premium filtering and tenant-scoped opaque voice handles.
- Contract 1.8.0 and least-privilege `tts:read` authorization.

### Changed

- The dashboard voice catalog now derives the effective plan from the authenticated session instead of trusting its compatibility argument.

## [0.8.0] - 2026-08-25

### Added

- Portable `get_private_media_upload_handoff` for local and private audio/video.
- Contract 1.7.0 with a non-secret authenticated deep link to the existing 5 GiB chunked uploader.

### Security

- The MCP tool accepts no file paths, inline bytes, bearer tokens, tenant IDs, or callbacks. Browser authentication remains mandatory before Wisprs issues its user- and session-bound upload token.

## [0.7.0] - 2026-08-25

### Added

- Durable, confirmed `retry_transcription` for failed jobs with retained source media.
- Contract 1.6.0 retry results and queue-replay convergence through the existing transcription pipeline.

## [0.6.0] - 2026-08-25

### Added

- Confirmed, expiring `create_share_link` and idempotent `revoke_share_link` operations.
- Contract 1.5.0 with minimal `sharing:write` authorization and action-specific results.
- Workspace-member denial for external sharing; personal users and workspace owners/admins remain eligible.

## [0.5.0] - 2026-08-25

### Added

- Durable `rename_transcript` and confirmed `edit_transcript_text` operations.
- Contract 1.4.0 action-specific mutation results with opaque transcript handles and new revision values.

### Safety

- Both mutations require the exact current transcript revision. Text edits are bounded literal find-and-replace operations, are marked destructive, and require `confirm: true`; stale revisions and missing matches fail with `OPERATION_CONFLICT`.

### Release status

- Pre-submission only. Production deployment, OAuth provisioning, and real-host certification remain required.

## [0.4.0] - 2026-08-25

### Added

- Durable, idempotent folder operations: `create_folder`, `rename_folder`, `move_transcript_to_folder`, and confirmed `delete_folder`.
- Contract 1.3.0 and least-privilege `operations:read` and `library:write` scopes.

### Safety

- Folder deletion is explicitly destructive, requires `confirm: true`, soft-deletes the folder, and preserves all media by moving it to the unfiled library.

### Release status

- Pre-submission only. Production scope provisioning and real-host certification remain required.

## [0.3.0] - 2026-08-25

### Added

- D24 read-only operating guidance for `list_transcripts`, `get_transcription_metadata`, `list_folders`, and `get_usage_and_limits`.
- Contract `1.2.0` metadata and the least-privilege `library:read` and `usage:read` scopes.

### Release status

- Pre-submission only. Production scope provisioning and ChatGPT/Claude host certification remain required before public distribution.

## [0.2.0] - 2026-08-24

### Added

- Tenant-aware semantic library search with opaque transcript handles and signed pagination.
- Durable summary, chapter, repurpose, translation, and export operations.
- Bounded `get_transcript_artifact` retrieval for generated content.
- Private one-hour MCP export resources for TXT, SRT, VTT, JSON, Markdown, and DOCX.

### Changed

- Public contract advanced additively to `1.1.0` and the host skill now covers all ten supported tools.

## [0.1.0] - 2026-08-23

### Added

- OpenAI universal plugin manifest for ChatGPT and Codex.
- Claude Code plugin and marketplace manifests.
- OAuth-enabled remote Streamable HTTP MCP configuration.
- Provider-neutral asynchronous transcription skill.
- Reviewer guide, host matrix, submission runbooks, release provenance, and automated package validation.
- Initial support for `transcribe_url`, `get_job_status`, and `get_transcript`.

### Security

- No bundled secrets, executable hooks, install scripts, static authorization headers, or local servers.
- Skill treats transcript and media-derived content as untrusted data.
