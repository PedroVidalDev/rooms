import type { PageHeaderProps } from "./types";

export const PageHeader = (props: PageHeaderProps) => {
  const { badge = "Arena de Voz 3D", title, subtitle } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#dfbe62",
        }}
      >
        {badge}
      </span>
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#e7edf5",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: "#e7edf5",
            opacity: 0.78,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
