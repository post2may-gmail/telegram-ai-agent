import type { CSSProperties } from "react";

export const color = {
  primary: "#7C3AED",
  onPrimary: "#FFFFFF",
  secondary: "#A78BFA",
  accent: "#0891B2",
  onAccent: "#000000",
  background: "#FAF5FF",
  foreground: "#1E1B4B",
  card: "#FFFFFF",
  muted: "#ECEEF9",
  mutedForeground: "#475569",
  border: "#DDD6FE",
  destructive: "#DC2626",
  onDestructive: "#FFFFFF",
  success: "#047857",
  successBg: "#ECFDF5",
  ring: "#7C3AED",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const font = {
  sans: '"Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace',
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(30, 27, 75, 0.06)",
  md: "0 4px 6px rgba(30, 27, 75, 0.08)",
} as const;

export const shell: CSSProperties = {
  minHeight: "100vh",
  background: color.background,
  color: color.foreground,
  fontFamily: font.sans,
  fontSize: 16,
  lineHeight: 1.5,
};

export const container: CSSProperties = {
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
  padding: "0 20px",
};

export const headerBar: CSSProperties = {
  borderBottom: `1px solid ${color.border}`,
  background: color.card,
};

export const headerInner: CSSProperties = {
  ...container,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: space.md,
  minHeight: 64,
  paddingTop: 12,
  paddingBottom: 12,
};

export const brand: CSSProperties = {
  color: color.foreground,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 18,
  cursor: "pointer",
};

export const nav: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: space.sm,
};

export const navLink = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 44,
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  cursor: "pointer",
  color: active ? color.onPrimary : color.foreground,
  background: active ? color.primary : "transparent",
  transition: "background 200ms ease, color 200ms ease",
});

export const main: CSSProperties = {
  ...container,
  paddingTop: space.xxl,
  paddingBottom: space.xxl,
};

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: space.sm,
  minHeight: 44,
  padding: "12px 24px",
  border: "none",
  borderRadius: 8,
  background: color.primary,
  color: color.onPrimary,
  fontFamily: "inherit",
  fontSize: 16,
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  transition: "opacity 200ms ease, background 200ms ease",
};

export const btnSecondary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "10px 22px",
  borderRadius: 8,
  border: `2px solid ${color.primary}`,
  background: "transparent",
  color: color.primary,
  fontFamily: "inherit",
  fontSize: 16,
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 200ms ease, color 200ms ease",
};

export const card: CSSProperties = {
  background: color.card,
  border: `1px solid ${color.border}`,
  borderRadius: 12,
  padding: space.lg,
  boxShadow: shadow.sm,
};

export const code: CSSProperties = {
  fontFamily: font.mono,
  fontSize: "0.9em",
  background: color.muted,
  color: color.foreground,
  padding: "2px 6px",
  borderRadius: 4,
};

export const skipLink: CSSProperties = {
  position: "absolute",
  left: 12,
  top: 12,
  zIndex: 100,
  padding: "10px 16px",
  background: color.primary,
  color: color.onPrimary,
  borderRadius: 8,
  fontWeight: 600,
  textDecoration: "none",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
};

export const iconWrap: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  background: color.muted,
  color: color.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
