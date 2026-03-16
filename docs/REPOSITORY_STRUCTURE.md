# Repository Structure

This project is organized for clear separation of routing, UI, services, and shared logic.

## Top-Level Layout

- `app/` — Next.js App Router pages and API routes.
- `components/` — Reusable UI and feature components.
- `services/` — Business/domain services (e.g. workflow and validation engines).
- `lib/` — Shared utility and integration helpers.
- `context/` — React context and global state bindings.
- `types.ts` — Shared TypeScript type surface used across the app.
- `docs/` — Developer-facing documentation.
- `.github/` — GitHub community health files and templates.

## Current OMEGA-Specific Modules

- `services/logicValidator.ts` — Ontology and graph consistency checks.
- `services/workflowEngine.ts` — Workflow command orchestration.
- `components/ConceptMap.tsx` — Graph visualization component.
- `constants.ts` — Shared constants for OMEGA modules.

## Conventions

1. Keep route handlers under `app/api/**/route.ts`.
2. Keep generic helpers in `lib/`; keep domain logic in `services/`.
3. Prefer strict types exported from `types.ts` for shared models.
4. Use `.github` templates for standardized issue/PR quality.
