# Agent Guide

This document provides guidance for coding agents working on this repository.

## Repository Overview

**unsaturated** is a TypeScript library published as an npm package.

### Structure

```
unsaturated/
├── src/                    # Library source code
│   └── index.ts           # Main entry point
├── dist/                  # Compiled output (git-ignored)
├── examples/
│   └── demo/              # Vite + React + TypeScript example
├── package.json           # Root package configuration
├── tsconfig.json          # TypeScript configuration
└── pnpm-workspace.yaml    # pnpm workspace configuration
```

### Technology Stack

- **Package Manager**: pnpm (workspace mode)
- **Language**: TypeScript
- **Module System**: ESM (ES Modules)
- **Code Formatting**: Prettier (default config)
- **Example Framework**: Vite + React + TypeScript

## Development Workflow

### Installation

```bash
pnpm install
```

### Building

```bash
# Build library
pnpm run build

# Build example project
pnpm --filter demo build
```

### Running Examples

```bash
pnpm run example
# This runs: pnpm --filter demo dev
```

### Code Formatting

```bash
# Format all files
pnpm run format

# Check formatting (CI)
pnpm run format:check
```

## Key Commands

| Command                    | Description               |
| -------------------------- | ------------------------- |
| `pnpm install`             | Install dependencies      |
| `pnpm run build`           | Build library (tsc)       |
| `pnpm run example`         | Run demo dev server       |
| `pnpm run format`          | Format code with Prettier |
| `pnpm run format:check`    | Check code formatting     |
| `pnpm --filter demo build` | Build demo project        |
| `pnpm --filter demo dev`   | Run demo dev server       |

## Architecture & Conventions

### Library Configuration

- **Module Format**: ESM only (no CommonJS)
- **TypeScript Target**: ES2020
- **Output**: `dist/index.js` + `dist/index.d.ts`
- **Exports**: Configured in `package.json` exports field

### Workspace Structure

The repository uses pnpm workspaces with:

- Root package: The library itself
- `examples/*`: Example projects that consume the library

The demo project references the library using `workspace:*` protocol, which pnpm resolves to the local package.

### Code Style

- **No ESLint**: This project does not use ESLint
- **Prettier**: Default Prettier configuration (no custom config)
- Format before committing changes

### TypeScript Configuration

- Strict mode enabled
- ES Module interop enabled
- Skip lib check enabled
- Source: `src/**/*`
- Output: `dist/`

## Making Changes

### When Modifying Library Code

1. Edit files in `src/`
2. Run `pnpm run build`
3. Test changes with `pnpm run example`
4. Run `pnpm run format` before committing

### When Modifying Example

1. Navigate to `examples/demo/`
2. Edit source files
3. Changes are hot-reloaded in dev mode
4. Run `pnpm --filter demo build` to verify production build

### Adding New Exports

1. Add exports to `src/index.ts`
2. Rebuild: `pnpm run build`
3. Update example to demonstrate new functionality

## Common Pitfalls

### Module Resolution

- This project uses **ESM**, not CommonJS
- Import statements must include the package name: `import { hello } from 'unsaturated'`
- The library exports are configured in `package.json` "exports" field

### Workspace Dependencies

- The demo project uses `"unsaturated": "workspace:*"`
- Changes to the library require rebuilding (`pnpm run build`)
- pnpm automatically symlinks the local package

### Build Output

- `dist/` is git-ignored
- Always run `pnpm run build` after library changes
- The `prepublishOnly` script ensures build happens before publishing

## File Formatting

Prettier configuration is intentionally minimal (uses defaults):

- No `.prettierrc` file
- Only `.prettierignore` excludes build artifacts
- Run `pnpm run format` to apply formatting

## Quick Start for Agents

1. **Check project state**: Run `pnpm install` if `node_modules` missing
2. **After library changes**: Run `pnpm run build`
3. **Before committing**: Run `pnpm run format`
4. **Test changes**: Run `pnpm run example` to see library in action
5. **Verify builds**: Run both `pnpm run build` and `pnpm --filter demo build`
