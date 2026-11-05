import type { CSSProperties } from "react";
import type { ButtonVariant } from "./types";

export const BUTTON_BASE_STYLE: CSSProperties = {
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "system-ui, sans-serif",
  cursor: "pointer",
  transition: "opacity 0.15s ease, transform 0.15s ease",
};

export const BUTTON_VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    border: "none",
    background: "#67d1bf",
    color: "#12202b",
    boxShadow: "0 6px 18px rgba(103, 209, 191, 0.22)",
  },
  secondary: {
    border: "none",
    background: "#dfbe62",
    color: "#12202b",
    boxShadow: "0 6px 18px rgba(223, 190, 98, 0.2)",
  },
  outline: {
    border: "1px solid #44505c",
    background: "#1d232b",
    color: "#dfbe62",
    boxShadow: "none",
  },
  danger: {
    border: "none",
    background: "#d96b6b",
    color: "#12202b",
    boxShadow: "none",
  },
};

export const BUTTON_DISABLED_STYLE: CSSProperties = {
  border: "none",
  background: "#2f3a45",
  color: "rgba(231, 237, 245, 0.45)",
  boxShadow: "none",
  cursor: "not-allowed",
};
