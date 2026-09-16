import type { Metadata } from "next";
import { AppHeader } from "./chrome";
import { font, shell, skipLink } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Проект 1 — Telegram ИИ-агент",
  description: "Локальный Telegram-бот и админка настроек промпта и модели",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        style={{
          ...shell,
          margin: 0,
          fontFamily: font.sans,
        }}
      >
        <a href="#main" className="skip-link" style={skipLink}>
          К содержанию
        </a>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
