# Anthropic submission runbook

Status: Claude Code package and remote connector materials prepared; no submission or approval claimed.

Anthropic treats Claude Code plugins and remote MCP connectors as separate distribution paths. Submit both from this release candidate, while keeping their review records distinct.

## Claude Code community plugin

1. Publish this package to the public repository `Wisprs/wisprs-ai-connectors` after repository security review.
2. Run `claude plugin validate --strict .` with the minimum supported Claude Code version and current stable version.
3. Load locally with `claude --plugin-dir .`, complete OAuth through `/mcp`, and execute every reviewer case.
4. Add the repository as a local marketplace and install `wisprs-ai-connectors@wisprs-plugins`; repeat install, reload, update, and uninstall tests.
5. Submit the public repository through the Claude plugin submission form. Team/Enterprise organizations may use the directory-admin form; individual authors may use the Console form.
6. Record the submitted commit SHA. Approved community listings are pinned to a commit, so every update requires a manifest version bump and passing CI at the new commit.
7. Confirm the plugin appears in the public community catalog before announcing availability. Review approval and catalog synchronization are separate events.

## Claude remote connector

1. Submit `https://wisprs.co/api/mcp` as the Wisprs remote connector through the current Anthropic connector-directory workflow.
2. Provide the same verified publisher, listing copy, policies, support URL, logo, OAuth behavior, tool metadata, reviewer credentials, and synthetic cases used for the package.
3. Verify Streamable HTTP, OAuth discovery, refresh/revocation behavior, and the exact supported tool set in Claude.ai.
4. Run all positive and negative cases in `REVIEWER_GUIDE.md`, including cross-tenant indistinguishability and idempotent retry.
5. Record connector submission and review evidence separately from the Claude Code plugin evidence.

## Required repository properties

- Publicly readable source and immutable release tag.
- No private application code, credentials, customer data, or hidden download/install behavior.
- `.claude-plugin/plugin.json` at plugin root, with other components outside that directory.
- `.mcp.json` using `type: http` and an HTTPS URL.
- Provider-neutral skill in `skills/wisprs/SKILL.md`.
- README, license, security policy, privacy explanation, changelog, reviewer guide, and provenance.

## Release and rollback

The package version, marketplace entry, and tagged commit move together. A connector-side emergency is handled with server runtime controls first. A package defect is fixed in a new semantic version; released tags are never rewritten.
