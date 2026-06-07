## [2026-06-07T04:26:29] Learnings
- Prisma requires both `DATABASE_URL` (transaction connection pooler port 6543) and `DIRECT_URL` (direct database connection port 5432) for running migrations successfully on Supabase.
- Express port binding is dynamically assigned by Render, but our `src/config/env.js` and `src/server.js` set up is fully compatible because it reads from `process.env.PORT` fallback.
- Render Free Tier has a sleeping policy of 15 minutes of inactivity, which breaks WebSockets and Cron jobs unless kept active via external ping service like cron-job.org.
- Deployment verification script `scripts/verify-deployment.js` correctly verifies database and Redis connectivity utilizing Prisma Client and ioredis, running cleanly as an ES module.
- Added `DIRECT_URL` to `render.yaml` to ensure Render prompts the user for it during deployment configuration.

- Prisma binary target mismatch (e.g. debian-openssl-3.0.x vs debian-openssl-1.1.x) causes the Prisma schema/migration engine binary to crash during execution on Render, throwing the syntax error 'Could not parse schema engine response: SyntaxError: Unexpected end of JSON input'. Specifying both 'debian-openssl-1.1.x' and 'debian-openssl-3.0.x' in 'binaryTargets' ensures compatibility across various Render Linux base image environments.

## [2026-06-07] Task Update Learnings
- Pinned Node.js engine version to `20.x` in `package.json` to prevent Render from resolving to experimental Node versions (like `26.3.0`) which breaks compatibility with Prisma 5.
- Restored `binaryTargets` in `src/prisma/schema.prisma` to only use `["native", "debian-openssl-3.0.x"]`, explicitly removing `debian-openssl-1.1.x` as it is no longer supported on Render.
