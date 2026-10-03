# Security policy

## Supported versions

Security fixes are provided for the latest released minor version. Pre-release and untagged builds are supported on a best-effort basis.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability and do not include customer data, OAuth tokens, private media URLs, or transcript content in any report.

Email `security@wisprs.co` with:

- affected package and version;
- affected host and operating system;
- a minimal reproduction using synthetic data;
- expected and observed behavior;
- potential impact; and
- a safe contact method for follow-up.

Wisprs will acknowledge a valid report within two business days, provide an initial severity assessment within five business days, and coordinate remediation and disclosure. These targets are response objectives, not a bug-bounty promise.

## Package trust boundary

This package contains declarative manifests, documentation, assets, and one provider-neutral skill. It ships no executable hooks, installation scripts, embedded credentials, local `stdio` server, telemetry collector, or customer data. All sensitive processing occurs on the authenticated Wisprs service.

The Claude package points to `https://wisprs.co/api/mcp/claude`; the OpenAI/Codex package points to `https://wisprs.co/api/mcp`. OAuth credentials are obtained and stored by the host. Never add static authorization headers or secrets to either MCP configuration.

## Security guarantees expected from the service

- HTTPS and OAuth audience validation;
- deny-by-default scopes and tenant isolation;
- opaque public resource identifiers;
- idempotent billable commands;
- bounded URL ingestion with SSRF protections;
- rate, concurrency, and cost controls;
- append-only security audit events; and
- content-free operational telemetry.

Marketplace review is not a substitute for these controls.
