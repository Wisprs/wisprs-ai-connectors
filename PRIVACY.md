# Privacy notice for the connector package

Effective: 2026-08-23

This repository is a client-side distribution package for the Wisprs service. Installing or inspecting it does not itself transmit data. When a user authorizes an MCP server and invokes a tool, the host sends tool inputs to the configured Wisprs endpoint: Claude uses `https://wisprs.co/api/mcp/claude`, while ChatGPT and Codex use `https://wisprs.co/api/mcp`.

## Data handled by the service

Depending on the tool, Wisprs may receive:

- the authenticated account and organization context supplied by OAuth;
- a public HTTPS media URL and optional display metadata;
- opaque operation, transcription, and pagination identifiers;
- service-generated security and reliability metadata; and
- the media and transcript content required to provide the requested service.

The package does not ask users to place credentials in prompts or configuration. OAuth tokens are handled by the host and service and must not be committed to this repository.

## Purposes

Data is processed to authenticate the user, perform requested transcription and transcript retrieval, prevent abuse and duplicate charges, enforce limits, maintain security and reliability, provide support, and meet legal obligations.

## Isolation and disclosure

The service scopes operations and resources to the authenticated account and organization. Possession of an opaque ID alone does not authorize access. Service providers may process data only where needed to deliver the service under applicable agreements.

## Retention and controls

Retention, deletion, subprocessors, international transfers, account controls, and data-subject rights are governed by the current Wisprs privacy policy at `https://wisprs.co/privacy`. Terms governing use are at `https://wisprs.co/terms`.

## Contact

Privacy questions: `privacy@wisprs.co`  
Security reports: `security@wisprs.co`  
Product support: `tosh@getwisprs.com`

This document explains the connector package and does not replace the service privacy policy.
