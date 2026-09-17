import { Bot } from "grammy";
import { getSecrets } from "./env";
import { askAgent } from "./openai";

type ChatMessage = { role: "user" | "assistant"; content: string };

const historyByChat = new Map<number, ChatMessage[]>();
const MAX_HISTORY = 20;

function getHistory(chatId: number): ChatMessage[] {
  return historyByChat.get(chatId) ?? [];
}

function pushHistory(chatId: number, message: ChatMessage) {
  const next = [...getHistory(chatId), message].slice(-MAX_HISTORY);
  historyByChat.set(chatId, next);
}

let botInstance: Bot | null = null;

export function getTelegramBot(): Bot {
  if (botInstance) return botInstance;

  const { telegramToken } = getSecrets();
  const bot = new Bot(telegramToken);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Привет! Я ИИ-агент. Напиши сообщение — отвечу.\n/reset — очистить историю диалога.",
    );
  });

  bot.command("reset", async (ctx) => {
    if (ctx.chat) historyByChat.delete(ctx.chat.id);
    await ctx.reply("История диалога очищена.");
  });

  bot.on("message:text", async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text.trim();
    if (!text) return;

    await ctx.replyWithChatAction("typing");

    try {
      const history = getHistory(chatId);
      const answer = await askAgent(text, history);
      pushHistory(chatId, { role: "user", content: text });
      pushHistory(chatId, { role: "assistant", content: answer });
      await ctx.reply(answer);
    } catch (err) {
      console.error("[bot] Agent error:", err);
      await ctx.reply(
        "Не удалось получить ответ от ИИ. Попробуй ещё раз чуть позже.",
      );
    }
  });

  bot.catch((err) => {
    console.error("[bot] Bot error:", err);
  });

  botInstance = bot;
  return bot;
}
