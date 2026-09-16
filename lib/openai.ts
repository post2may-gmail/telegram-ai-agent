import OpenAI from "openai";
import { getSecrets } from "./env";
import { readAgentSettings } from "./agent-store";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: getSecrets().apiGpt });
  }
  return client;
}

export async function askAgent(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
): Promise<string> {
  const settings = readAgentSettings();
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: settings.model,
    messages: [
      { role: "system", content: settings.prompt },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Пустой ответ от модели");
  return text;
}
