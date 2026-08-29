# Release process

## Versioning

Use Semantic Versioning. Keep `package.json`, `release.json`, `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and `CHANGELOG.md` synchronized.

## Build

1. Branch from a protected, current default branch.
2. Update manifests, skill, docs, contract digest, and changelog.
3. Run `npm run validate` and both host-native validators.
4. Run the host matrix and retain redacted evidence.
5. Complete security, load, legal, and reviewer-account gates.
6. Build the deterministic archive with `npm run package`.
7. Verify the archive on a clean machine and compare its SHA-256 digest.

## Provenance and publication

- Require reviewed pull requests and passing CI.
- Enable secret scanning, dependency review, code scanning, and protected tags.
- Create an annotated, cryptographically signed `v<version>` tag from the reviewed commit.
- Publish the archive, SHA-256 checksum, generated file inventory, and SBOM/provenance attestation with the release.
- Never rebuild or move an existing tag. Correct a release with a new patch version.

## Compatibility

The public server contract is version `1.10.0`. Additive tools ship in a package minor release after host review. Breaking changes require a new contract major version, parallel server compatibility window, migration guide, and package major release.

## Emergency response

Server-side controls can deny write tools globally, by client, tenant, user, or tool without changing the package. During a safety incident, disable the smallest effective scope, reconcile accepted cost reservations, preserve audit evidence, notify affected users, and only then prepare a package update if required.
