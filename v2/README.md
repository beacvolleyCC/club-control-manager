# Club Control V2 – isolated workspace

This directory is the first executable scaffold. No LIVE writes, no deployment configuration, and no V1 imports.

Run from `v2/`: `npm install`, `npm run typecheck`, `npm test`.

Current packages: `@club-control/domain` shared TypeScript contracts; first node:test guard tests. The contracts are provisional and must be validated against TEST schema and business rules before API implementation.

Next: add schema adapters and contract tests, scoped authorization matrix, then independently deployed Manager/Player shells.
