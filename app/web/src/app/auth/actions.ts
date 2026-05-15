"use server";

/**
 * TYPES: Authentication server action return state
 */
type AuthActionState = {
	ok: boolean;
	message: string | null;
	token?: string | null;
};

/**
 * CONSTANTS: API configuration and defaults
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
	console.warn(
		"[Auth] NEXT_PUBLIC_API_BASE_URL not set; defaulting to http://127.0.0.1:8000"
	);
}

/**
 * ACTIONS: Server-side authentication handlers
 */

/**
 * loginAction: Authenticate a user via username and password.
 *
 * Validates client-side input, then sends credentials to FastAPI POST /auth/login endpoint.
 * The endpoint uses OAuth2PasswordRequestForm, so credentials are sent as URLSearchParams.
 * Returns JWT access token on success.
 *
 * @param _prevState - Previous action state (for useActionState hook)
 * @param formData - Form data containing username and password fields
 * @returns AuthActionState with ok flag, message, and optional token
 */
export async function loginAction(
	_prevState: AuthActionState,
	formData: FormData
): Promise<AuthActionState> {
	const username = String(formData.get("username") ?? "").trim();
	const password = String(formData.get("password") ?? "");

	if (!username || !password) {
		return { ok: false, message: "Username and password are required." };
	}

	const payload = new URLSearchParams();
	payload.set("username", username);
	payload.set("password", password);

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: payload,
			cache: "no-store",
		});
	} catch (error) {
		console.error("[Auth] Login request failed", error);
		return { ok: false, message: "Network error. Please try again." };
	}

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		const message =
			(data && typeof data.detail === "string") ? data.detail : "Request failed. Please try again.";
		console.error("[Auth] Login failed", { status: response.status, message });
		return { ok: false, message };
	}

	const data = (await response.json()) as {
		access_token: string;
		token_type: string;
	};

	return { ok: true, message: "Login successful.", token: data.access_token };
}

/**
 * registerAction: Create a new user account.
 *
 * Validates client-side input (username, email, password match), then sends to FastAPI
 * POST /auth/register endpoint. The endpoint expects UserCreate schema (username, email, password)
 * in JSON format. Returns UserResponse on success (user data without password).
 *
 * @param _prevState - Previous action state (for useActionState hook)
 * @param formData - Form data containing username, email, password, and confirmPassword fields
 * @returns AuthActionState with ok flag and message (no token returned on registration)
 */
export async function registerAction(
	_prevState: AuthActionState,
	formData: FormData
): Promise<AuthActionState> {
	const username = String(formData.get("username") ?? "").trim();
	const email = String(formData.get("email") ?? "").trim();
	const password = String(formData.get("password") ?? "");
	const confirmPassword = String(formData.get("confirmPassword") ?? "");

	if (!username || !email || !password) {
		return { ok: false, message: "All fields are required." };
	}

	if (password !== confirmPassword) {
		return { ok: false, message: "Passwords do not match." };
	}

	if (password.length < 8) {
		return { ok: false, message: "Password must be at least 8 characters." };
	}

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password }),
			cache: "no-store",
		});
	} catch (error) {
		console.error("[Auth] Registration request failed", error);
		return { ok: false, message: "Network error. Please try again." };
	}

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		const message =
			(data && typeof data.detail === "string") ? data.detail : "Request failed. Please try again.";
		console.error("[Auth] Registration failed", {
			status: response.status,
			message,
		});
		return { ok: false, message };
	}

	return { ok: true, message: "Account created successfully." };
}
