# account-gql

Required Environment Variables: 
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_HOOK_SHARED_SECRET
- DISCORD_BOT_TOKEN
- AUTH_SECRET
- STRIPE_SECRET_KEY
- UPLOADER_BASE

Optional Environment Variables: 
- PORT
- UPLOADER_SECRET

## Local Development Utilities

Use Node 20 for local development (`.nvmrc` and `.node-version` are included).

### Configure environment variables

1. Copy `.env.template` to `.env`.
2. Fill in real secrets in `.env`.
3. Keep `.env` uncommitted (it is gitignored).

### Start local services

```bash
docker compose up -d
```

### Seed local dummy fixture data

```bash
yarn seed-dummy
```

This writes `scripts/.seed-dummy.json` with event/mentor/student/project fixture data for local testing workflows.

### Generate an auth token

```bash
yarn generate-token -- event-test-2025 admin
```

Roles supported: `admin`, `manager`, `mentor`, `student`.

### Test GraphQL queries

```bash
API_KEY=<token-from-generate-token> yarn test-queries
```

Fail CI when Auth0-backed checks are skipped:

```bash
API_KEY=<token-from-generate-token> yarn test-queries:strict
```

You can also enable strict mode via environment variable:

```bash
TEST_QUERIES_STRICT=1 API_KEY=<token> yarn test-queries
```