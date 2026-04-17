---
name: feishu-cli-wish-sync-integration
description: Use when maintaining legacy wish-wall or song-request flows that already use this skill name; for new or non-wish projects, prefer feishu-cli-structured-sync.
---

# Feishu CLI Wish Sync Integration (Legacy Alias)

## Overview
This skill is kept as a compatibility alias for wish-specific projects.
If your payload is not wish-only, use `feishu-cli-structured-sync`.

## Use This Alias When
- Existing code or docs explicitly reference this old name.
- You only need wish-wall or song-request style payloads.
- You want minimal migration risk for legacy teams.

## Migrate To Generic Skill
1. Keep your endpoint and auth token contract unchanged.
2. Move field mapping logic to a domain-neutral mapper.
3. Switch operational docs to `feishu-cli-structured-sync`.
4. Keep this alias available until all references are updated.

## Reference
See `feishu-cli-structured-sync` for the full reusable workflow and troubleshooting matrix.
