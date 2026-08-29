# Host compatibility matrix

This matrix separates package readiness from live certification. A row is `PASS` only after the named version has completed every required positive and negative case against the release candidate and evidence has been retained.

| Surface             | Package path                                               | Minimum or target version         | Authentication path                                        | Required tests                                                                                          | Current evidence                                        |
| ------------------- | ---------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| MCP Inspector       | `.mcp.json` endpoint                                       | Current stable at certification   | OAuth discovery and browser grant                          | initialize, tools/list, resources/templates/list, twenty-five supported tools, reconnect, revoked token | Not run against production release candidate            |
| ChatGPT web/desktop | `.codex-plugin/plugin.json` plus registered MCP connection | Current production release        | ChatGPT developer-mode OAuth                               | install, auth, starter prompts, async polling, paged transcript, negative auth/tenant cases             | Package only; connection ID not registered              |
| Codex desktop/CLI   | `.codex-plugin/plugin.json` and `.mcp.json`                | Current production release        | Host-managed OAuth                                         | plugin validation, install, implicit skill selection, all reviewer cases                                | Manifest validator available; live host test pending    |
| Claude connector    | Remote endpoint submitted separately                       | Current Claude production release | Connector OAuth                                            | add connector, authenticate, tools/list, positive and negative cases                                    | Endpoint/package prepared; directory submission pending |
| Claude Code         | `.claude-plugin/plugin.json`, `.mcp.json`, `skills/`       | 2.1.196+                          | RFC 9728 discovery and dynamic client registration or CIMD | strict plugin validation, local load, marketplace install, OAuth, skill, reload                         | Local schema validation required before release         |
| Claude Cowork       | Remote connector                                           | Current production release        | Connector OAuth                                            | authorize, invoke supported tools, disconnect/revoke                                                    | Pending connector availability and review               |

## Release test environments

Each certification record must capture:

- UTC timestamp, host name, exact host version, operating system, and package commit SHA;
- Wisprs environment and server contract version;
- fresh reviewer account and organization identifiers stored only in the approved secret system;
- test-case IDs, outcome, latency, operation ID, and redacted trace/correlation ID;
- screenshots or recordings containing synthetic data only; and
- defect link, severity, owner, and retest result for every failure.

## Compatibility policy

- The package version and both plugin manifest versions move together.
- Server changes must remain backward-compatible within contract major version `1`.
- A host marked certified remains supported for its captured version and newer compatible patch releases until evidence shows otherwise.
- Any host schema, OAuth, transport, or tool-metadata change reopens its affected cases.
- Unsupported tools remain absent from the skill workflow even if declared in the wider server contract.
- Public submission is blocked until the production-smoke and load-certification gates are complete.
