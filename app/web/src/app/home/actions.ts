"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type LogoutActionState = {
	ok: boolean;
	message: string | null;
};

export async function logoutAction(): Promise<LogoutActionState> {
	const cookieStore = await cookies();
	(cookieStore as any).delete("access_token");
	(cookieStore as any).delete("auth_token");

	redirect("/auth/login");
}
