# Reviewer guide

Use only the dedicated reviewer account, synthetic media, and synthetic transcript content. Reviewer credentials are delivered through each platform's secure submission field and never stored in this repository, issue tracker, or screenshots.

## Preconditions

1. Package commit and version match `release.json`.
2. `npm run validate` and both host-native manifest validators pass.
3. The submitted endpoint is healthy and returns OAuth protected-resource metadata when unauthenticated: Claude uses `https://wisprs.co/api/mcp/claude`; OpenAI uses `https://wisprs.co/api/mcp`.
4. Write tools are enabled for the reviewer tenant and its spend cap is intentionally small.
5. The test media origin is public HTTPS, controlled by Wisprs, and contains no personal data. Use the reviewer sample `https://wisprs.co/samples/wisprs-reviewer-sample.mp3` (22 seconds of synthetic English speech). Do not use music-only media such as the promo video: it completes with zero segments, which is correct but exercises nothing.

## Positive cases

### P1 — OAuth and discovery

Connect the host to its submitted endpoint, complete browser authorization, and list tools. Expect 39 tools on Claude and 43 on OpenAI, plus the private export resource template. Every tool name must be <=64 characters and have a precise title and description. Pure reads use `readOnlyHint: true` and `destructiveHint: false`; tools that create, update, or delete data use `readOnlyHint: false` and `destructiveHint: true`, prompting before execution. Claude must not advertise or execute `list_tts_voices`, `synthesize_speech`, `list_tts_syntheses`, or `get_tts_audio`, including when directly called by name. The universal OpenAI endpoint retains them. Neither endpoint advertises or executes `get_video_transcript` (platform caption scraping). No token appears in logs or UI.

### P2 — Submit a transcription

Ask: `Transcribe the reviewer sample at the supplied public HTTPS URL.` Confirm billable work when prompted. Expect one `transcribe_url` call and an immediate receipt with `operationId`, `queued` or `running`, `submittedAt`, and `retryAfterSeconds`.

After completion, verify `search_library`, one export format, summary, chapters, one repurpose mode, and translation. Retrieve generated content with `get_transcript_artifact`; read exports from the exact private `wisprs://exports/res_…` URI and confirm expiry/cross-tenant denial.

### P3 — Idempotent ambiguous retry

Repeat P2 with the identical idempotency key after simulating a lost client response. Expect the same operation and original submission time, with no second transcription or reservation.

### P4 — Respect asynchronous polling

Check P2 until terminal. Expect `get_job_status` calls no faster than each returned `retryAfterSeconds`, monotonic progress, and `completed` with one opaque `transcriptionId`.

### P5 — Retrieve paged transcript

Retrieve P4's transcript. Expect ordered text, preserved speaker/timing fields when present, a bounded page, and `nextCursor` when more text exists. Continue with the exact cursor and verify no gap or duplicate.

### P6 — Reconnect without duplicate work

Disconnect the host after P2, reconnect, and query the saved operation. Expect the same status/result and no additional command execution.

### P7 — Revoke and reauthorize

Revoke the OAuth grant, verify the next call requires authentication, then authorize again. Expect the original tenant's authorized resources to remain available and no resource from another tenant to appear.

## Negative cases

### N1 — Unsafe source URL

Try an HTTP URL, loopback address, private IP literal, credential-bearing URL, and public hostname resolving to a private address. Expect a structured safe failure before media processing and no durable billable transcription.

### N2 — Cross-tenant opaque ID

From reviewer tenant B, request an operation or transcript created by tenant A. Expect the same `NOT_FOUND` shape as a random nonexistent opaque ID, with no existence, tenant, filename, or timing leak.

### N3 — Invalid or tampered cursor

Modify one character of a transcript cursor or reuse it with another transcript. Expect a validation/not-found response, no transcript content, and no internal signing detail.

### N4 — Revoked/expired token

Call after revocation or token expiry. Expect an OAuth challenge with no tool result, customer content, stack trace, or dependency detail.

### N5 — Rate and cost limit

Exceed the reviewer tenant's documented command limit or spend cap. Expect `RATE_LIMITED` or `QUOTA_EXCEEDED`, a retry hint where appropriate, and no work beyond the accepted allowance.

## Evidence checklist

- Redacted request/response transcript for each case.
- Server-side operation count proving P3 and P6 did not duplicate work.
- Audit event IDs proving authorized reads and denied attempts were recorded.
- Host screenshot for install, OAuth consent, receipt, completion, and transcript page.
- No secrets, media contents, email addresses, tenant IDs, or internal database IDs in evidence.

## Pass criteria

All positive cases pass, all negative cases fail safely, no severity-1 or severity-2 defect remains open, and telemetry shows no content-bearing attributes. A reviewer timeout is not converted into a pass; retest after fixing the cause.
