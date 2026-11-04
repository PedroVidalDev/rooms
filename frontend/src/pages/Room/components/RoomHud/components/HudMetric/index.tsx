import type { HudMetricProps } from "./types";

export const HudMetric = (props: HudMetricProps) => {
  const {
    label,
    value,
    valueColor = "#e7edf5",
    letterSpacing = "0.02em",
  } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.72,
        }}
      >
        {label}
      </span>
      <strong style={{ fontSize: 14, color: valueColor, letterSpacing }}>
        {value}
      </strong>
    </div>
  );
};
