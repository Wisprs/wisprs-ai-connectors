# Evidence — public repository and release provenance (2026-08-29)

Repository: https://github.com/Wisprs/wisprs-ai-connectors (public, Wisprs org).

- **Clean public history**: exported from the monorepo with fresh history (no
  private paths; the package validator's private-reference scan passes on the
  export).
- **Branch protection on `main`**: no force pushes, no deletion, linear history
  required, enforced for admins, required status check `package` (the validate
  workflow) with strict up-to-date requirement.
- **Signed tag**: `v0.19.1` is a signed tag; GitHub reports `verified=true`. (`v0.19.0` is retained per the never-move-tags
  rule; its release is marked superseded because its CI run predates the
  package-scan fix.)
- **CI**: `Validate distribution package` green on `main` and on the tagged
  commit.
- **Release**: https://github.com/Wisprs/wisprs-ai-connectors/releases/tag/v0.19.1
  with archive `wisprs-ai-connectors-v0.19.1.zip`
  (sha256 `a3952db92268875a1a7decc6c03a34e6dc0a64cf72a1c68c599d906ba98cac22`),
  `.sha256` checksum file, generated file inventory, and an SPDX 2.3 SBOM.
- **Security features**: Dependabot vulnerability alerts enabled; GitHub's
  default protections for public repositories are on.

Residual: GitHub Artifact Attestations (build provenance signed in Actions)
not yet configured — the SBOM + checksum + signed tag satisfy the gate's
"SBOM/provenance artifact" requirement in its minimal form; upgrade to
`actions/attest-build-provenance` in a follow-up if reviewer feedback asks.
