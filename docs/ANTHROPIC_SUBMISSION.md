# Anthropic submission runbook

Status: Claude Code package and remote connector materials prepared; no submission or approval claimed. The Claude endpoint is `https://wisprs.co/api/mcp/claude` and excludes all four TTS tools at registration time. The universal endpoint must not be submitted to the Claude directory under the current AI-audio-generation restriction.

The current Claude developer portal accepts separate remote MCP connector and GitHub plugin-bundle listings. Submit the connector first, then the bundle, from the same Wisprs-owned paid Claude organization. Point the bundle at the same Claude endpoint and keep review records distinct. Recheck the current review criteria before submission.

## Claude Code community plugin

1. Publish this package to the public repository `Wisprs/wisprs-ai-connectors` after repository security review.
2. Run `claude plugin validate --strict .` with the minimum supported Claude Code version and current stable version.
3. Load locally with `claude --plugin-dir .`, run Claude Code's `/mcp` command to complete OAuth, and execute every reviewer case.
4. Add the repository as a local marketplace and install `wisprs-ai-connectors@wisprs-plugins`; repeat install, reload, update, and uninstall tests.
5. Submit the public repository as a plugin bundle through `https://claude.ai/directory/manage`; the older Console form is no longer supported.
6. Record the submitted commit SHA. Approved community listings are pinned to a commit, so every update requires a manifest version bump and passing CI at the new commit.
7. Confirm the plugin appears in the public community catalog before announcing availability. Review approval and catalog synchronization are separate events.

## Claude remote connector

1. Submit `https://wisprs.co/api/mcp/claude` as the Wisprs remote connector through `https://claude.ai/directory/manage`.
2. Provide the same verified publisher, listing copy, policies, support URL, logo, OAuth behavior, tool metadata, reviewer credentials, and synthetic cases used for the package.
3. Verify Streamable HTTP, OAuth discovery, refresh/revocation behavior, and the exact supported tool set in Claude.ai.
4. Run all positive and negative cases in `REVIEWER_GUIDE.md`, including cross-tenant indistinguishability and idempotent retry.
5. Record connector submission and review evidence separately from the Claude Code plugin evidence.

Policy gate: verify that tool discovery exposes exactly the 39 reviewed non-TTS tools, that direct calls to all four excluded TTS tools fail without execution, and that the plugin skill and listing describe speech-to-text rather than audio generation. Tool names must be at most 64 characters; every tool needs an accurate title and narrow, behavior-matching description. Pure reads must be `readOnlyHint: true` and `destructiveHint: false`; tools that create, update, or delete data must be `readOnlyHint: false` and `destructiveHint: true` so Claude requires confirmation. Keep reads and mutations as purpose-built separate tools, never a catch-all query/write method. Test every advertised tool with valid and invalid inputs through MCP Inspector and Claude. These local controls are not a claim of Anthropic approval.

## Required repository properties

- Publicly readable source and immutable release tag.
- No private application code, credentials, customer data, or hidden download/install behavior.
- `.claude-plugin/plugin.json` at plugin root, with other components outside that directory.
- `.mcp.json` using `type: http` and an HTTPS URL.
- Provider-neutral skill in `skills/wisprs/SKILL.md`.
- README, license, security policy, privacy explanation, changelog, reviewer guide, and provenance.

## Release and rollback

The package version, marketplace entry, and tagged commit move together. A connector-side emergency is handled with server runtime controls first. A package defect is fixed in a new semantic version; released tags are never rewritten.
