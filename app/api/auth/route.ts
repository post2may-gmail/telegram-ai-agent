import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getAdminSession,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, login: session.login });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      login?: unknown;
      password?: unknown;
    };

    if (typeof body.login !== "string" || typeof body.password !== "string") {
      return NextResponse.json(
        { error: "Нужны поля login и password" },
        { status: 400 },
      );
    }

    if (!verifyCredentials(body.login, body.password)) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 },
      );
    }

    const token = createSessionToken(body.login);
    const response = NextResponse.json({
      authenticated: true,
      login: body.login,
    });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      sessionCookieOptions(7 * 24 * 60 * 60),
    );
    console.info("[api] Admin login success");
    return response;
  } catch (err) {
    console.error("[api] POST /api/auth/login failed:", err);
    return NextResponse.json(
      { error: "Не удалось выполнить вход" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", sessionCookieOptions(0));
  console.info("[api] Admin logout");
  return response;
}
