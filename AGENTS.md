# AGENTS.md

Repository guidance for coding agents working in this project.

## Project Overview

- This is a small Cloudflare Workers + D1 TypeScript repository.
- The Worker entrypoint is `src/index.ts`.
- The D1 binding is named `DB` in `wrangler.json`.
- Runtime types are generated into `worker-configuration.d.ts`.
- Source code is intentionally small and direct; there is no framework router or ORM.

## Source of Truth

When behavior and docs disagree, trust the code and config files you just read.

Key files:

- `package.json` — scripts and tool surface.
- `tsconfig.json` — TypeScript constraints.
- `wrangler.json` — Worker entrypoint and D1 binding.
- `src/index.ts` — routing and D1 access.
- `src/token.ts` — token type and runtime validation helpers.
- `src/renderHtml.ts` — homepage HTML rendering.
- `migrations/*.sql` — D1 schema.
- `README.md` — setup and API docs.

## Editor / Agent Rule Files

I did not find any of the following in this repository:

- `AGENTS.md` before this file was added
- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

Do not assume hidden editor rules exist elsewhere in the repo.

## Install and Run Commands

Use the commands that actually exist in `package.json`.

### Install dependencies

```bash
npm install
```

### Main project commands

```bash
npm run cf-typegen
npm run check
npm run dev
npm run seedLocalD1
npm run deploy
```

What they do:

- `npm run cf-typegen` → `wrangler types`
- `npm run check` → `tsc && wrangler deploy --dry-run`
- `npm run dev` → `pnpm seedLocalD1 && wrangler dev`
- `npm run seedLocalD1` → apply local D1 migrations
- `npm run deploy` → deploy the Worker

### Build / lint / test status

- There is no dedicated build script beyond `npm run check`.
- There is no lint script in `package.json`.
- There is no formatter script in `package.json`.
- There is no automated test runner configured in `package.json`.
- There are no repo test files or `tests/` directory in the current codebase.

### Single-test command

There is currently no single-test command because there is no test framework configured.

If asked to run "a single test", first confirm whether the repo has added a test runner since this file was written.

### Practical validation commands

Use these as the closest thing to verification in the current repo:

```bash
npm run check
npx wrangler d1 migrations apply DB --local
npx wrangler dev
```

For manual API verification, use `curl` against the local Worker.

## Package Manager Notes

- `package-lock.json` exists, so `npm` is a safe default.
- The `dev` script shells into `pnpm seedLocalD1 && wrangler dev`.
- Be careful with package-manager assumptions; the repository mixes npm artifacts and a pnpm-based script.
- If `npm run dev` fails because `pnpm` is unavailable, inspect scripts before changing anything.

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

Keep new TypeScript source under `src/` because `tsconfig.json` includes `src`.

## Architecture and Coding Pattern

The project uses a single Worker fetch handler.

Patterns visible in `src/index.ts`:

- Manual route branching with `if` statements.
- Direct use of `new URL(request.url)`.
- Tiny helpers instead of abstractions.
- Direct `Response.json(...)` and `new Response(...)` usage.
- Inline SQL strings for D1 operations.
- `env.DB.prepare(...).bind(...).run()/all()/first()` for database access.

Prefer extending the current simple structure over introducing routers, services, or ORMs unless the user explicitly asks for a refactor.

## Current Runtime Behavior

As of the current code:

- `GET /` returns HTML using `renderHtml()`.
- `POST /tokens` parses and upserts a token object.
- `GET /tokens` returns all token rows.
- `GET /tokens?account_id=...` returns one token row.
- `DELETE /tokens?account_id=...` deletes one token row.

If you change route behavior, update both code and docs.

## Important Data-Model Caution

There is drift across the repository right now:

- `src/index.ts` queries the `tokens` table and also reads `comments` for the homepage.
- `src/renderHtml.ts` still references `comments`.
- `README.md` still contains legacy comments-table documentation.
- `migrations/0001_create_accounts_table.sql` creates `accounts`, not `tokens` or `comments`.

Do not assume schema, homepage, and docs are aligned.

Before editing storage code, verify all of these together:

1. SQL migrations in `migrations/`
2. D1 queries in `src/index.ts`
3. Public docs in `README.md`
4. Any homepage/demo copy in `src/renderHtml.ts`

## TypeScript Guidelines

`tsconfig.json` enables strict mode. Respect it.

- Keep code compatible with `"strict": true`.
- Do not add `as any`.
- Do not add `@ts-ignore`, `@ts-expect-error`, or similar suppressions.
- Prefer `unknown` for untrusted inputs.
- Narrow with explicit runtime checks and type guards.
- Keep types local and readable.
- Use interfaces for stable object shapes when that matches current patterns.

Existing pattern to follow:

- `parseToken(value: unknown)` validates unknown JSON.
- `isToken(value: unknown): value is Token` provides a type guard.
- `const tokenFields = [...] as const satisfies readonly (keyof Token)[]` is an acceptable pattern here.

## Imports

Follow the existing import style:

- Use relative imports like `./token` and `./renderHtml`.
- No path aliases are configured.
- Keep imports minimal and grouped at the top of the file.
- Avoid unused imports.

## Formatting Conventions

Match the current repository style instead of reformatting unrelated code.

- Use tabs for indentation in TypeScript and JSON files, matching existing files.
- Use double quotes.
- Use semicolons.
- Keep helper functions small.
- Avoid broad formatting-only diffs.

There is no configured Prettier or ESLint setup in the repo, so consistency with nearby code matters more than tool-driven formatting.

## Naming Conventions

Use descriptive variable names.

- Use `camelCase` for local variables and function names.
- Use `PascalCase` for interfaces and types.
- Preserve `snake_case` for external token payload fields and matching DB column names.
- Keep route-local helper names short but descriptive, such as `requestBody`, `accountId`, or `existingToken`.

Avoid vague names like `data`, `obj`, or `tmp` when a clearer name is available.

## Error Handling

Follow the existing API style for user-facing errors:

- Return JSON error payloads like `{ error: "..." }`.
- Use `400` for invalid input.
- Use `404` when a requested resource is missing.
- Let unexpected infrastructure/database failures surface rather than hiding them with empty catches.

Do not write empty catch blocks.

If parsing JSON input:

- Parse with `await request.json()`.
- Catch parse failures narrowly.
- Return a clear `400` error response.

## Database and Migration Rules

When touching D1-related code:

- Keep using prepared statements.
- Use `.bind(...)` for parameters.
- Keep SQL explicit and readable.
- Prefer one clear query over abstraction layers.
- Update or add SQL migrations instead of silently assuming schema exists.

After changing schema or bindings:

```bash
npm run cf-typegen
npm run seedLocalD1
npm run check
```

Do not hand-edit `worker-configuration.d.ts`; it is generated.

## Documentation Expectations

If you change commands, routes, request shapes, or storage schema, update `README.md` in the same change.

Because this repo has already drifted, documentation updates are not optional cleanup; they are part of finishing the task.

## Verification Expectations for Agents

Before claiming work is done:

1. Run `npm run check`.
2. Apply local migrations if schema changed.
3. Manually hit changed endpoints with `curl` if behavior changed.
4. Read the affected files back to ensure docs, SQL, and code still agree.

If no tests exist for the change, say so explicitly instead of implying test coverage.

## Change Scope Guidance

- Prefer minimal, surgical edits.
- Do not refactor unrelated parts of this small repo unless explicitly asked.
- Preserve the existing Worker style.
- Avoid introducing dependencies for problems already solved with built-in APIs.

## Generated and Local-State Files

- `worker-configuration.d.ts` is generated.
- `.wrangler/` is local state and should not be treated as source.
- `.env*` and `.dev.vars*` are ignored locally; do not depend on them being committed.

## Final Reminder

This repo is small enough that coding agents should read the whole relevant file cluster before editing.

For D1-related work, that usually means reading:

- `src/index.ts`
- `src/token.ts`
- `migrations/*.sql`
- `README.md`
- `wrangler.json`

Stay strict, stay minimal, and keep code, schema, and docs aligned.
