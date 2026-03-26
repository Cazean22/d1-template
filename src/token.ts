import { z } from "zod/v4";

export const TokenSchema = z.object({
	id_token: z.string(),
	access_token: z.string(),
	refresh_token: z.string(),
	account_id: z.string(),
	last_refresh: z.string(),
	email: z.string(),
	type: z.string(),
	expired: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;

export const TokenUpdateSchema = TokenSchema.omit({ account_id: true }).partial().refine(
	(obj) => Object.keys(obj).length > 0,
	{ message: "At least one field must be provided for update." },
);

export type TokenUpdate = z.infer<typeof TokenUpdateSchema>;

export function parseToken(value: unknown) {
	const result = TokenSchema.safeParse(value);

	if (!result.success) {
		return { error: z.prettifyError(result.error) };
	}

	return { token: result.data };
}

export function isToken(value: unknown): value is Token {
	return TokenSchema.safeParse(value).success;
}
