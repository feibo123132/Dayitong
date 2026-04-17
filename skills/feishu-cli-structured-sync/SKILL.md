---
name: feishu-cli-structured-sync
description: Use when syncing structured records from a frontend or backend service into Feishu Base through a local gateway and lark-cli, especially for cross-project reuse, schema mapping, CORS and token issues, Windows spawn problems, JSON payload quoting errors, and sensitive-data workflows such as medical or customer records.
---

# Feishu CLI Structured Sync

## Overview
Use this skill to build, harden, and debug a reusable sync pipeline:
source app -> local gateway -> lark-cli -> Feishu Base.

This is domain-agnostic. It applies to wish walls, medical records, customer intake, issue reports, and operations logs.

## Standard Architecture
1. Source app sends JSON to a gateway endpoint.
2. Gateway validates auth token and payload schema.
3. Gateway converts source fields into Feishu table fields.
4. Gateway writes with `lark-cli base +record-upsert`.
5. Gateway returns deterministic result (`ok` or explicit error).

## Input Contract
- `FEISHU_BASE_TOKEN`
- `FEISHU_BASE_TABLE_ID`
- Shared auth token between source app and gateway
- Endpoint URL used by the source app
- Confirmed target table fields from Feishu

## Non-Negotiable Rules
- Always list real table fields before mapping:
`lark-cli base +field-list --base-token <token> --table-id <table-id>`
- Never guess field names or select options.
- On Windows, spawn CLI child process with `shell: true` and `windowsHide: true`.
- Use `--json @relative-file.json` for upsert payloads.
- Keep `@file` path relative to the project working directory.
- Support `OPTIONS` preflight and CORS headers on submit endpoint.

## Schema Design Pattern
Use hybrid storage for long or regulated content:
- Structured columns for filtering and dashboards.
- Raw text column for full context.
- Optional source metadata columns (`source`, `record_id`, `created_at`, `sync_status`).

Example for medical records:
- Structured: complaint, assessment, triage_level, warning_flags, visit_time
- Raw: full_case_text
- Metadata: patient_ref_masked, source_project, synced_at

## Sensitive Data Mode
For medical, legal, finance, or HR content:
1. Mask direct identifiers before sync.
2. Store only minimum required fields.
3. Restrict table permissions by role.
4. Keep audit logs for sync requests and write results.
5. Define retention and deletion policy.

## Endpoint Contract Pattern
- Health endpoint: `GET /health` -> `{ "ok": true }`
- Submit endpoint: `POST /<domain>/submit`
- Response:
  - success: `{ "ok": true }`
  - failure: `{ "ok": false, "error": "<message>" }`

## Verification Ladder
Run in this order:
1. Health check succeeds.
2. CORS preflight returns `204` with expected headers.
3. Auth token mismatch returns `401`.
4. Valid payload returns `200` with `{ "ok": true }`.
5. Row appears in Feishu table with correct mapped fields.

## Error Playbook
- `sync not configured` in source app
Fix: source app env not loaded or endpoint missing; restart app process and verify runtime env.

- `spawn EINVAL` or `spawn EPERM` on Windows
Fix: gateway child process spawn options are incorrect; use `shell: true`.

- `--json invalid JSON object`
Fix: avoid inline JSON in command args; switch to `--json @relative-file.json`.

- `--json invalid JSON file path ... must be a relative path`
Fix: write payload JSON inside project directory and pass relative path.

- Feishu `not_found` for a field
Fix: field mapping drift; refresh field list and update mapping logic.

- Browser request blocked before submit
Fix: missing CORS or missing `OPTIONS` handler.

## Reuse Checklist For Any New Project
1. Create a domain-specific payload schema.
2. Confirm Feishu table schema and select options.
3. Implement deterministic field mapping function.
4. Configure env variables in source app and gateway.
5. Run full verification ladder.
6. Add one synthetic record test for CI or smoke scripts.

## Success Criteria
- Source app submit message indicates sync success.
- Gateway logs show successful upsert without schema errors.
- Feishu Base contains expected row values and metadata.

