# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + React + TypeScript app.
- `src/main.tsx`: app bootstrap.
- `src/App.tsx`, `src/layouts/`: top-level composition and shared layout.
- `src/pages/`: route-level pages (use `*Page.tsx` naming).
- `src/components/`: reusable UI modules.
- `src/store/`: Zustand state stores (`use*Store.ts`).
- `src/types/`: shared TypeScript types.
- `public/`: static assets served as-is.
- `dist/`: build output (generated, do not edit).

## Build, Test, and Development Commands
Use `pnpm` (lockfile is `pnpm-lock.yaml`).
- `pnpm install`: install dependencies.
- `pnpm dev`: run local Vite dev server with HMR.
- `pnpm build`: run TypeScript project build, then production bundle.
- `pnpm preview`: preview the production build locally.
- `pnpm lint`: run ESLint on the full project.

## Coding Style & Naming Conventions
- Language: TypeScript + TSX, ES modules.
- Indentation: 2 spaces; keep imports grouped and ordered logically.
- Components/pages/layouts: PascalCase file and symbol names (for example, `HomeCarousel.tsx`).
- Hooks/stores: `useXxx` camelCase (for example, `useGuessMusicStore.ts`).
- Types/interfaces: PascalCase; place shared models in `src/types`.
- Linting: follow `eslint.config.js` (`@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`). Fix lint warnings before opening a PR.

## Testing Guidelines
A test framework is not configured yet in `package.json`.
- Minimum requirement before merge: `pnpm lint` and `pnpm build` must pass.
- When adding tests, prefer Vitest + React Testing Library.
- Suggested naming: `ComponentName.test.tsx` (or `module.test.ts`) colocated with source or in `src/__tests__/`.

## Commit & Pull Request Guidelines
Current history mixes Conventional-style and short descriptive commits (for example, `fix_build_errors`, `feat_setup_github_pages`, `feat_add_roadshow`).
- Preferred format: `<type>_<scope>: <summary>` or `<type>: <summary>` where type is `feat`, `fix`, `chore`, `refactor`, `docs`.
- Keep each commit focused on one change.
- PRs should include: purpose, key changes, verification steps (commands run), linked issue (if any), and UI screenshots/GIFs for page-level visual changes.
