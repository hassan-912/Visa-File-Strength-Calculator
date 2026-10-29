<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MG project toolkit

The user selected Impeccable, Emil Kowalski's design skills, Taste Skill, and Shannon for these projects on 2026-10-29. Claude-Mem and the LinkedIn agent are deferred.

- For existing portal UI improvements, use `C:/Users/Menna/.codex/skills/impeccable/SKILL.md` as the main design workflow. Preserve the established MG identity, bilingual behavior, and existing product facts.
- For interaction details, mobile behavior, and UI edge cases, consult `emil-design-eng`, `mobile-native`, or `break-ui` under `C:/Users/Menna/.codex/skills/` when relevant.
- For an authorized new visual direction or a new landing page, use `C:/Users/Menna/.codex/skills/design-taste-frontend/SKILL.md`. Choose one primary design workflow for each task; do not combine contradictory styling instructions.
- Keep visa calculations and eligibility logic separate from visual changes. Design tooling does not validate immigration rules or justify changing assessments.
- Shannon is for requested security testing against local or staging targets with disposable data. Run it as the unprivileged `mgtools` user inside WSL2's `Ubuntu-24.04` using `/opt/mg-toolkit/bin/shannon`; it requires Docker. Check readiness first and do not claim a security assessment ran based on installation alone.
- Do not activate Claude-Mem or the LinkedIn agent until the user requests them again.

## User interface preferences — confirmed 29 October 2026

- Tourism, Immigration and Job Seeker must remain separate tools at their existing separate URLs. Do not add a shared portal navigation bar or merge their screens unless the user explicitly asks. The MG Workspace remains a separate hub linking to each tool.
- Immigration live scores (Canada CRS and Australia GSM) must stay fixed and visible while scrolling the form. On smaller screens, reserve space below the header so scores do not cover form controls. Do not move them into normal document flow during future UI polishing.
