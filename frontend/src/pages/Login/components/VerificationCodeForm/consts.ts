import type { CSSProperties } from "react";

export const VERIFICATION_CODE_LENGTH = 6;

export const CODE_INPUTS_ROW_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: 10,
};

export const CODE_DIGIT_INPUT_BASE_STYLE: CSSProperties = {
  width: "100%",
  height: 54,
  borderRadius: 10,
  border: "1px solid #44505c",
  background: "#1d232b",
  color: "#e7edf5",
  fontSize: 22,
  fontWeight: 800,
  fontFamily: "system-ui, sans-serif",
  textAlign: "center",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

export const CODE_DIGIT_INPUT_ACTIVE_STYLE: CSSProperties = {
  border: "1px solid #67d1bf",
  boxShadow: "0 0 12px rgba(103, 209, 191, 0.22)",
};

export const CODE_DIGIT_INPUT_FILLED_STYLE: CSSProperties = {
  border: "1px solid rgba(103, 209, 191, 0.55)",
};

export const CODE_DIGIT_INPUT_ERROR_STYLE: CSSProperties = {
  border: "1px solid rgba(217, 107, 107, 0.75)",
};
