# Evidence — package structure and schemas (2026-08-29)

Package version: 0.19.0. Contract: 1.10.0 (44 tools), snapshot sha256
`d0651a7877d4b619bad0e331a09f72aa4616d5f59c9670b4ac68c29f4c754d6e`.

## Local validator + tests

`npm run validate` (validate-package.mjs + check-links.mjs + node --test): PASS
(3/3 tests). Archive rebuilt deterministically:
`dist/wisprs-ai-connectors-v0.19.0.zip`
sha256 `fcc9371024f5bc151daa935c0a09d818cb1d8b70f47edd2c582b53a259c45d5f`.

## Claude host-native validator

`claude plugin validate --strict .` (Claude Code CLI, local): **Validation passed**
against `.claude-plugin/marketplace.json`.

## Server-side test suite

The server-side MCP test suite in the application repository: 132 tests, 125 pass,
0 fail, 7 skipped (integration tests gated on Postgres/Redis services; they run
green in `.github/workflows/mcp-ci.yml`).

## Still pending for this gate

- OpenAI validator run (needs the ChatGPT developer-mode import flow).
- Re-run of `claude plugin validate` from the published public repository
  checkout rather than the monorepo working tree.
