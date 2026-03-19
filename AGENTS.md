# AGENTS.md
Repository guidance for coding agents working in this project.

## Project Overview
- Small Cloudflare Workers + D1 TypeScript repo.
- Worker entrypoint: `src/index.ts`.
- D1 binding name: `DB` from `wrangler.json`.
- Generated runtime types: `worker-configuration.d.ts`.
- No router, ORM, test framework, lint config, or formatter config is set up.

## Rule Files Present
I did **not** find: older `AGENTS.md`, `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md`.
Do not assume hidden Cursor or Copilot rules exist elsewhere.

## Source of Truth
When behavior, docs, and schema disagree, trust files you just read in this order:
1. `src/index.ts`
2. `migrations/*.sql`
3. `wrangler.json`
4. `README.md`
Key files: `package.json`, `tsconfig.json`, `src/index.ts`, `src/token.ts`, `src/renderHtml.ts`, `README.md`.

## Commands
Use real scripts from `package.json`.

### Install
```bash
npm install
```

### Main commands
```bash
npm run cf-typegen
npm run check
npm run dev
npm run seedLocalD1
npm run deploy
```

### What they do
- `npm run cf-typegen` → `wrangler types`
- `npm run check` → `tsc && wrangler deploy --dry-run`
- `npm run dev` → `pnpm seedLocalD1 && wrangler dev`
- `npm run seedLocalD1` → apply local D1 migrations
- `npm run deploy` → deploy the Worker

## Build / Lint / Test Reality
- No dedicated build script beyond `npm run check`
- No lint script
- No formatter script
- No automated test runner configured
- No repo test files or `tests/` directory found
- No single-test command exists today because no test framework is configured

### Practical validation commands
```bash
npm run check
npx wrangler d1 migrations apply DB --local
npx wrangler dev
```
For endpoint verification, use `curl` against the local Worker.

## Package Manager Note
- `package-lock.json` exists, so `npm` is the safe default.
- The `dev` script still shells into `pnpm`.
- If `npm run dev` fails because `pnpm` is missing, inspect scripts before changing them.

## Repository Layout
```text
src/
  index.ts
  token.ts
  renderHtml.ts
migrations/
  *.sql
package.json
tsconfig.json
wrangler.json
worker-configuration.d.ts
README.md
```
Keep new TypeScript files under `src/` because `tsconfig.json` only includes `src`.

## Architecture Pattern
Follow the existing Worker style:
- single `fetch` handler in `src/index.ts`
- manual route branching with `if` statements
- `new URL(request.url)` for request parsing
- direct `Response.json(...)` / `new Response(...)`
- inline SQL strings
- D1 access with `env.DB.prepare(...).bind(...).run()/all()/first()`
Prefer extending this simple pattern over adding abstractions unless explicitly asked.

## Current Runtime Behavior
- `GET /` returns HTML from `renderHtml()`
- `POST /tokens` validates and upserts one token
- `GET /tokens` returns all token rows
- `GET /tokens?account_id=...` returns one token row
- `DELETE /tokens?account_id=...` deletes one token row
If you change route behavior, update code and docs together.

## Important Data-Model Caution
The repo is currently drifted:
- `src/index.ts` reads/writes `tokens`
- `src/renderHtml.ts` still references `comments`
- `README.md` still contains legacy comments-table content
- `migrations/0001_create_accounts_table.sql` creates `accounts`
Do not assume schema, docs, and homepage copy are aligned.
Before changing storage behavior, read these together: `src/index.ts`, `migrations/*.sql`, `README.md`, `src/renderHtml.ts`.

## TypeScript Guidelines
`tsconfig.json` has `strict: true`. Respect it.
- Never add `as any`
- Never add `@ts-ignore`, `@ts-expect-error`, or similar
- Prefer `unknown` for untrusted input
- Narrow with explicit runtime checks and type guards
- Keep types local and readable
- Use interfaces when they fit the existing code
Existing pattern to follow:
- `parseToken(value: unknown)` validates unknown JSON
- `isToken(value: unknown): value is Token` is the type guard
- `const tokenFields = [...] as const satisfies readonly (keyof Token)[]` is acceptable here

## Imports, Formatting, Naming
- Use relative imports like `./token` and `./renderHtml`
- No path aliases are configured
- Keep imports minimal and at the top of the file
- Use tabs, double quotes, and semicolons to match current files
- Keep helpers small and focused
- Avoid broad formatting-only diffs
- Use `camelCase` for locals/functions and `PascalCase` for interfaces/types
- Preserve `snake_case` for external token fields and matching DB columns
- Prefer descriptive names like `requestBody`, `accountId`, and `existingToken`

## Error Handling
- Return JSON errors like `{ error: "..." }`
- Use `400` for invalid input and `404` for missing resources
- Let unexpected infrastructure/database failures surface
- Do not write empty catch blocks
- When parsing JSON, use `await request.json()`, catch parse failures narrowly, and return a clear `400` response

## Database and Migration Rules
- Keep using prepared statements and always use `.bind(...)`
- Keep SQL explicit and readable
- Prefer direct queries over abstraction layers
- Add or update migrations instead of assuming schema exists
- After schema or binding changes, run `npm run cf-typegen`, `npm run seedLocalD1`, and `npm run check`
- Do not hand-edit `worker-configuration.d.ts`

## Documentation and Verification
- If you change commands, routes, request shapes, or schema, update `README.md` in the same change
- Before claiming work is done: run `npm run check`, apply local migrations if needed, manually hit changed endpoints, and read changed files back to ensure code, docs, and SQL still agree
- If there are no tests for your change, say that explicitly

## Change Scope Guidance
- Prefer minimal, surgical edits
- Do not refactor unrelated parts unless asked
- Preserve the current Worker style
- Avoid adding dependencies for problems already solved with built-in APIs

## Generated and Local-State Files
- `worker-configuration.d.ts` is generated
- `.wrangler/` is local state
- `.env*` and `.dev.vars*` are local/ignored and should not be relied on

## Final Reminder
For D1-related work, the usual read cluster is: `src/index.ts`, `src/token.ts`, `migrations/*.sql`, `README.md`, `wrangler.json`.
Stay strict, stay minimal, and keep schema, code, and docs aligned.
