# OpenAI submission runbook

Status: package prepared; public submission intentionally gated.

OpenAI publishes one universal plugin entry shared by ChatGPT and Codex. This package combines a remote MCP server with a provider-neutral skill. The public submission must describe and scan the MCP server directly; it must not reference an already-published integration as a shortcut.

## Organization prerequisites

- The submitting OpenAI organization owns the Wisprs listing.
- The submitter is an organization owner or has Apps Management `Write` permission.
- Wisprs business identity is verified in the same organization and project.
- Publisher name, website, support contact, privacy policy, and terms match public Wisprs properties.
- A dedicated reviewer account exists, is least-privilege, has synthetic data only, and has a deliberately bounded spend limit.

## Private connection and package wiring

1. Enable developer mode in ChatGPT.
2. Register the public MCP URL `https://wisprs.co/api/mcp` and complete OAuth.
3. Save the generated technical connection identifier in the approved release secret store.
4. Generate `.app.json` from that registered connection only for the release candidate; never invent an identifier or commit reviewer credentials.
5. Add `"apps": "./.app.json"` to the release-candidate Codex manifest and rerun validation.
6. Install from the private source and run every case in `REVIEWER_GUIDE.md` in both ChatGPT and Codex.

The source package uses `.mcp-openai.json` for the universal endpoint so OpenAI retains the complete toolset, including TTS. Claude uses `.mcp.json` and its separately constrained endpoint. The OpenAI portal receives the MCP server as a fresh server-backed plugin submission.

## Listing materials

- Name: `Wisprs`
- Category: `Productivity`
- Short description: `Transcribe media and retrieve transcripts.`
- Long description: `Turn a public HTTPS audio or video URL into a durable Wisprs transcription job, check progress, and retrieve the completed transcript in bounded pages.`
- Website: `https://wisprs.co`
- Support: `https://wisprs.co/contact`
- Privacy: `https://wisprs.co/privacy`
- Terms: `https://wisprs.co/terms`
- MCP server: `https://wisprs.co/api/mcp`
- Logo: `assets/wisprs-logo.png` (512×512 PNG)
- Composer icon: `assets/wisprs-icon.png` (128×128 PNG)
- Starter prompts: the three prompts in `.codex-plugin/plugin.json`

## Portal sequence

1. Open the OpenAI plugin submission portal in the verified organization.
2. Create a new MCP-backed plugin submission.
3. Supply listing, country availability, policy attestations, server URL, authentication details, tool metadata, reviewer guide, and secure reviewer credentials.
4. Complete domain verification exactly as the portal requests. Add a challenge only after the portal issues it, record it in the release evidence, and remove stale challenges after approval when allowed.
5. Run the portal's MCP scan. Compare every discovered tool name, resource template, schema, annotation, scope, and description to contract `1.15.0` and the universal 43-tool release list.
6. Save as a draft and run the private review matrix again against the exact candidate.
7. Submit only after all release gates in `SUBMISSION_GATES.md` are green.
8. Record portal submission ID and timestamp outside this public repository. Monitor review, answer reviewer questions, and rerun affected tests after any change.

## Update and rollback

- Patch: copy or metadata corrections with no contract behavior change.
- Minor: backward-compatible tool or workflow additions.
- Major: incompatible manifest or server-contract change.
- Keep the previous signed package and server behavior deployable until the new listing is approved and stable.
- If production safety degrades, disable write tools server-side immediately; do not wait for marketplace delisting.

Public approval must never be inferred from a successful local install or portal draft.
