# Contributing Guide

Thanks for contributing to this project.

## Development Setup

1. Install dependencies:
   - `npm install`
2. Start the development server:
   - `npm run dev`

## Branching and Commits

- Create a feature branch from the default branch.
- Use clear, scoped commit messages.
- Keep pull requests focused on one logical change.

## Required Checks Before Opening a PR

Run the following commands locally:

- `npm run -s type-check`
- `npm run -s lint`
- `npm run -s test`

If a check fails due to environment limitations, explain it in the PR.

## Pull Request Expectations

- Fill out `.github/PULL_REQUEST_TEMPLATE.md`.
- Include a clear summary and rationale.
- Reference related issues.
- Add screenshots for user-facing UI changes.

## Repository Structure Expectations

Use the canonical structure documented in `docs/REPOSITORY_STRUCTURE.md`.

- Route handlers live in `app/api/**/route.ts`.
- Reusable UI belongs in `components/`.
- Domain logic belongs in `services/`.
- Shared helper logic belongs in `lib/`.

## Code Style

- Prefer explicit TypeScript types.
- Avoid adding new `any` without justification.
- Keep modules small and cohesive.
- Reuse existing utilities before introducing new ones.
