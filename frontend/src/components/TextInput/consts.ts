import type { CSSProperties } from "react";

export const TEXT_INPUT_LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#e7edf5",
  opacity: 0.75,
};

export const TEXT_INPUT_BASE_STYLE: CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #44505c",
  background: "#1d232b",
  color: "#e7edf5",
  padding: "11px 12px",
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

export const TEXT_INPUT_ERROR_BORDER_STYLE: CSSProperties = {
  border: "1px solid rgba(217, 107, 107, 0.75)",
};

export const TEXT_INPUT_ERROR_TEXT_STYLE: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.35,
  color: "#f5b5b5",
};
