# Worker + D1 Database

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template)

![Worker + D1 Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cb7cb0a9-6102-4822-633c-b76b7bb25900/public)

<!-- dash-content-start -->

D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). This project demonstrates using a Worker with a D1 binding to execute a SQL statement. A simple frontend displays the result of this query:

```SQL
SELECT * FROM comments LIMIT 3;
```

The D1 database is initialized with a `comments` table and this data:

```SQL
INSERT INTO comments (author, content)
VALUES
    ('Kristian', 'Congrats!'),
    ('Serena', 'Great job!'),
    ('Max', 'Keep up the good work!')
;
```

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/d1-template#setup-steps) before deploying.

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=cloudflare/templates/d1-template
```

A live public deployment of this template is available at [https://d1-template.templates.workers.dev](https://d1-template.templates.workers.dev)

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "d1-template-database":
   ```bash
   npx wrangler d1 create d1-template-database
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.
3. Run the following db migration to initialize the database (notice the `migrations` directory in this project):
   ```bash
   npx wrangler d1 migrations apply --remote d1-template-database
   ```
4. Deploy the project!
   ```bash
   npx wrangler deploy
   ```

## Token API

This Worker now exposes a small token storage API backed by D1. The token payload uses these fields:

```json
{
  "id_token": "wZMKVHVp40iJhwNm2xzn_Y3Z6naSkDWMrkQapxkDQw",
  "access_token": "QqJfz1vESKUu9H0IOpxsEbr5DxcBs5AWWTTCd54Wn8cSyBRyPWmrL9OY3t7IGNR1dp7MeSE",
  "refresh_token": "rt_qdx0MbDxq---",
  "account_id": "19648e17-f567-4507-85bf-2cba128c6e53",
  "last_refresh": "2026-03-19T09:49:07Z",
  "email": "bette3bb803@qii.leadharbor.org",
  "type": "codex",
  "expired": "2026-03-29T09:49:06Z"
}
```

When running locally with `npx wrangler dev`, you can call the API like this:

### Create or update a token

```bash
curl -X POST http://127.0.0.1:8787/tokens \
  -H "content-type: application/json" \
  -d '{
    "id_token": "wZMKVHVp40iJhwNm2xzn_Y3Z6naSkDWMrkQapxkDQw",
    "access_token": "QqJfz1vESKUu9H0IOpxsEbr5DxcBs5AWWTTCd54Wn8cSyBRyPWmrL9OY3t7IGNR1dp7MeSE",
    "refresh_token": "rt_qdx0MbDxq---",
    "account_id": "19648e17-f567-4507-85bf-2cba128c6e53",
    "last_refresh": "2026-03-19T09:49:07Z",
    "email": "bette3bb803@qii.leadharbor.org",
    "type": "codex",
    "expired": "2026-03-29T09:49:06Z"
  }'
```

This returns the stored token object with HTTP `201`.

### List all tokens

```bash
curl http://127.0.0.1:8787/tokens
```

This returns a JSON array of stored token objects.

### Read one token by account ID

```bash
curl "http://127.0.0.1:8787/tokens?account_id=19648e17-f567-4507-85bf-2cba128c6e53"
```

This returns the matching token object, or:

```json
{ "error": "Token not found." }
```

with HTTP `404` if no matching row exists.

### Delete one token by account ID

```bash
curl -X DELETE "http://127.0.0.1:8787/tokens?account_id=19648e17-f567-4507-85bf-2cba128c6e53"
```

This returns:

```json
{
  "deleted": true,
  "account_id": "19648e17-f567-4507-85bf-2cba128c6e53"
}
```

If `account_id` is missing, the API returns HTTP `400`. If the token does not exist, it returns HTTP `404`.
