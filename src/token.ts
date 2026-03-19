export interface Token {
	id_token: string;
	access_token: string;
	refresh_token: string;
	account_id: string;
	last_refresh: string;
	email: string;
	type: string;
	expired: string;
}

const tokenFields = [
	"id_token",
	"access_token",
	"refresh_token",
	"account_id",
	"last_refresh",
	"email",
	"type",
	"expired",
] as const satisfies readonly (keyof Token)[];

interface ValidationResult {
	token?: Token;
	error?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function parseToken(value: unknown): ValidationResult {
	if (!isObject(value)) {
		return { error: "Request body must be a JSON object." };
	}

	const idToken = value.id_token;
	if (typeof idToken !== "string") {
		return { error: "Field 'id_token' must be a string." };
	}

	const accessToken = value.access_token;
	if (typeof accessToken !== "string") {
		return { error: "Field 'access_token' must be a string." };
	}

	const refreshToken = value.refresh_token;
	if (typeof refreshToken !== "string") {
		return { error: "Field 'refresh_token' must be a string." };
	}

	const accountId = value.account_id;
	if (typeof accountId !== "string") {
		return { error: "Field 'account_id' must be a string." };
	}

	const lastRefresh = value.last_refresh;
	if (typeof lastRefresh !== "string") {
		return { error: "Field 'last_refresh' must be a string." };
	}

	const email = value.email;
	if (typeof email !== "string") {
		return { error: "Field 'email' must be a string." };
	}

	const tokenType = value.type;
	if (typeof tokenType !== "string") {
		return { error: "Field 'type' must be a string." };
	}

	const expired = value.expired;
	if (typeof expired !== "string") {
		return { error: "Field 'expired' must be a string." };
	}

	return {
		token: {
			id_token: idToken,
			access_token: accessToken,
			refresh_token: refreshToken,
			account_id: accountId,
			last_refresh: lastRefresh,
			email,
			type: tokenType,
			expired: expired,
		},
	};
}

export function isToken(value: unknown): value is Token {
	if (!isObject(value)) {
		return false;
	}

	for (const field of tokenFields) {
		if (typeof value[field] !== "string") {
			return false;
		}
	}

	return true;
}
