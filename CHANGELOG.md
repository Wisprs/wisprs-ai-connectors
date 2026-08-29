# Changelog

All notable package changes are documented here. Versions follow Semantic Versioning.

## [Unreleased]

- Platform review, production compatibility certification, and signed release tag remain gated.

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
