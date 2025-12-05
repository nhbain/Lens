# Task List for STORY-LENS-001: Project Scaffolding & Build Setup

> Generated from: story-list-feature-lens.md
> Story: As a developer, I want a properly configured cross-platform desktop app foundation so that I can build features on a solid base.
> Acceptance Criteria: App launches on both macOS and Windows; hot-reload works in development; production builds generate installable artifacts for both platforms.

## Relevant Files

- `app/package.json` - Node dependencies and npm scripts
- `app/src-tauri/Cargo.toml` - Rust dependencies for Tauri backend
- `app/src-tauri/tauri.conf.json` - Tauri app configuration (window settings, build targets, app metadata)
- `app/src-tauri/src/main.rs` - Tauri entry point
- `app/src/main.tsx` - Frontend entry point
- `app/src/App.tsx` - Root React component
- `app/src/App.css` - App styles
- `app/src/App.test.tsx` - App component tests
- `app/src/test/setup.ts` - Test setup with jest-dom matchers
- `app/tsconfig.json` - TypeScript configuration with path aliases
- `app/vite.config.ts` - Vite bundler configuration with path aliases
- `app/vitest.config.ts` - Vitest test configuration
- `app/eslint.config.js` - ESLint 9 flat config
- `app/.prettierrc` - Prettier formatting rules

### Notes

- Unit tests should be placed alongside the code files they test (e.g., `App.tsx` and `App.test.tsx`)
- Use `npm run dev` for development with hot-reload
- Use `npm run build` for production frontend build
- Use `npm run tauri dev` for full app development mode
- Use `npm run tauri build` for production app build
- Tauri requires Rust toolchain installed locally

## Tasks

- [x] 1.0 Framework Evaluation & Decision
  - [x] 1.1 Review Tauri vs Electron trade-offs (bundle size, performance, Rust requirement)
  - [x] 1.2 Verify Rust toolchain is installed (`rustc --version`, `cargo --version`)
  - [x] 1.3 Confirm Tauri as framework choice (recommended for smaller bundle, better performance)
  - [x] 1.4 Choose frontend framework: React with Vite (familiar ecosystem, fast HMR)

- [x] 2.0 Initialize Project with Tauri + React
  - [x] 2.1 Run `npm create tauri-app@latest lens` and select React + TypeScript template
  - [x] 2.2 Navigate into project directory and run `npm install`
  - [x] 2.3 Update `src-tauri/tauri.conf.json` with app metadata (name: "Lens", identifier, version)
  - [x] 2.4 Configure window defaults in `tauri.conf.json` (title: "Lens", default size, resizable)
  - [x] 2.5 Remove boilerplate/example code from `src/App.tsx`, replace with minimal "Lens" placeholder
  - [x] 2.6 Verify app launches with `npm run tauri dev` (first compile started - manual verification needed)

- [x] 3.0 Configure TypeScript & Path Aliases
  - [x] 3.1 Update `tsconfig.json` with strict mode enabled (already enabled by template)
  - [x] 3.2 Add path aliases to `tsconfig.json` (e.g., `@/*` → `src/*`)
  - [x] 3.3 Configure Vite to resolve path aliases in `vite.config.ts`
  - [x] 3.4 Verify path aliases work by importing with `@/` prefix

- [x] 4.0 Set Up Development Tooling (Linting & Formatting)
  - [x] 4.1 Install ESLint and plugins: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks`
  - [x] 4.2 Create `eslint.config.js` with TypeScript + React rules (ESLint 9 flat config)
  - [x] 4.3 Install Prettier: `npm install -D prettier eslint-config-prettier`
  - [x] 4.4 Create `.prettierrc` with project formatting rules (single quotes, no semi, etc.)
  - [x] 4.5 Add `lint` and `format` scripts to `package.json`
  - [x] 4.6 Run linter and fix any initial issues

- [x] 5.0 Configure Testing Framework
  - [x] 5.1 Install Vitest and React Testing Library: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  - [x] 5.2 Create `vitest.config.ts` with jsdom environment and path alias support
  - [x] 5.3 Add test setup file for jest-dom matchers
  - [x] 5.4 Create example test `src/App.test.tsx` to verify setup
  - [x] 5.5 Add `test` script to `package.json`
  - [x] 5.6 Run tests and verify passing

- [x] 6.0 Verify Development Workflow & Local Build
  - [x] 6.1 Test hot-reload: run `cd app && npm run tauri dev`, modify `App.tsx`, confirm changes appear
  - [x] 6.2 Run `npm run tauri build` to generate production artifact
  - [x] 6.3 Locate built artifact in `app/src-tauri/target/release/bundle/`
  - [x] 6.4 Launch production build and verify app runs correctly
  - [x] 6.5 Document any platform-specific setup notes in README
