import type { SectionDividerProps } from "./types";

export const SectionDivider = (props: SectionDividerProps) => {
  const { label } = props;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(88, 112, 138, 0.35)" }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#e7edf5",
          opacity: 0.6,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(88, 112, 138, 0.35)" }} />
    </div>
  );
};
