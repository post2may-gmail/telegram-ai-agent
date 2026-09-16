import { NextResponse } from "next/server";
import {
  AVAILABLE_MODELS,
  readAgentSettings,
  writeAgentSettings,
} from "@/lib/agent-store";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return unauthorized();

  const settings = readAgentSettings();
  return NextResponse.json({
    settings,
    models: AVAILABLE_MODELS,
  });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorized();

  try {
    const body = (await request.json()) as {
      prompt?: unknown;
      model?: unknown;
    };

    if (typeof body.prompt !== "string" || typeof body.model !== "string") {
      return NextResponse.json(
        { error: "Нужны поля prompt и model (строки)" },
        { status: 400 },
      );
    }

    if (!body.prompt.trim()) {
      return NextResponse.json(
        { error: "Промпт не может быть пустым" },
        { status: 400 },
      );
    }

    if (!body.model.trim()) {
      return NextResponse.json(
        { error: "Модель не может быть пустой" },
        { status: 400 },
      );
    }

    const settings = writeAgentSettings({
      prompt: body.prompt,
      model: body.model,
    });

    console.info("[api] Agent settings saved");
    return NextResponse.json({ settings, models: AVAILABLE_MODELS });
  } catch (err) {
    console.error("[api] PUT /api/agent failed:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 },
    );
  }
}
