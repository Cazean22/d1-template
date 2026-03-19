import { renderHtml } from "./renderHtml";
import { isToken, parseToken } from "./token";

function json(data: unknown, init?: ResponseInit) {
	return Response.json(data, init);
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/tokens" && request.method === "POST") {
			let requestBody: unknown;

			try {
				requestBody = await request.json();
			} catch {
				return json(
					{ error: "Request body must be valid JSON." },
					{ status: 400 },
				);
			}

			const { token, error } = parseToken(requestBody);

			if (!token) {
				return json({ error }, { status: 400 });
			}

			await env.DB.prepare(
				`INSERT INTO tokens (
					id_token,
					access_token,
					refresh_token,
					account_id,
					last_refresh,
					email,
					type,
					expired
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT(account_id) DO UPDATE SET
					id_token = excluded.id_token,
					access_token = excluded.access_token,
					refresh_token = excluded.refresh_token,
					last_refresh = excluded.last_refresh,
					email = excluded.email,
					type = excluded.type,
					expired = excluded.expired`,
			)
				.bind(
					token.id_token,
					token.access_token,
					token.refresh_token,
					token.account_id,
					token.last_refresh,
					token.email,
					token.type,
					token.expired,
				)
				.run();

			return json(token, { status: 201 });
		}

		if (url.pathname === "/tokens" && request.method === "GET") {
			const accountId = url.searchParams.get("account_id");

			if (!accountId) {
				const { results } = await env.DB.prepare(
					`SELECT
						id_token,
						access_token,
						refresh_token,
						account_id,
						last_refresh,
						email,
						type,
						expired
					FROM tokens`,
				).all();

				const tokens = results.filter(isToken);

				return json(tokens);
			}

			const result = await env.DB.prepare(
				`SELECT
					id_token,
					access_token,
					refresh_token,
					account_id,
					last_refresh,
					email,
					type,
					expired
				FROM tokens
				WHERE account_id = ?`,
			)
				.bind(accountId)
				.first();

			if (!result || !isToken(result)) {
				return json({ error: "Token not found." }, { status: 404 });
			}

			return json(result);
		}

		if (url.pathname === "/tokens" && request.method === "DELETE") {
			const accountId = url.searchParams.get("account_id");

			if (!accountId) {
				return json(
					{ error: "Query parameter 'account_id' is required." },
					{ status: 400 },
				);
			}

			const existingToken = await env.DB.prepare(
				`SELECT account_id
				FROM tokens
				WHERE account_id = ?`,
			)
				.bind(accountId)
				.first();

			if (!existingToken) {
				return json({ error: "Token not found." }, { status: 404 });
			}

			await env.DB.prepare(
				`DELETE FROM tokens
				WHERE account_id = ?`,
			)
				.bind(accountId)
				.run();

			return json({ deleted: true, account_id: accountId });
		}

		if (url.pathname !== "/" || request.method !== "GET") {
			return json({ error: "Not found." }, { status: 404 });
		}

		const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
		const { results } = await stmt.all();

		return new Response(renderHtml(JSON.stringify(results, null, 2)), {
			headers: {
				"content-type": "text/html",
			},
		});
	},
} satisfies ExportedHandler<Env>;
