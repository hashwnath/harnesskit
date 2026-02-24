# my-project — Copilot Instructions

## Tech Stack
Language: node

## Build & Validate
```bash
npm run build
npm test
npm run lint
npm start
```

## Architecture
See docs/ARCHITECTURE.md. Run `harnesskit enforce` to validate.

## Conventions
- Parse at boundaries
- Cross-cutting through shared/provider layer only
- Every new function needs tests
- Update docs/QUALITY_SCORE.md when quality changes
