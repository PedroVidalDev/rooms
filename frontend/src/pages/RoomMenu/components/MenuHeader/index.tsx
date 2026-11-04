import type { MenuHeaderProps } from "./types";

export const MenuHeader = (props: MenuHeaderProps) => {
  const {
    badge = "3D Voice Arena",
    title = "English Rooms",
    subtitle = "Escolha uma sala disponível, entre usando o ID ou crie uma nova arena de conversação.",
  } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "center" }}>
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
    </div>
  );
};
