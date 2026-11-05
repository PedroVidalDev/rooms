import { DEFAULT_BANNER_HIGHLIGHTS } from "./consts";
import type { AuthBannerProps } from "./types";

export const AuthBanner = (props: AuthBannerProps) => {
  const {
    badge = "Arena de Voz 3D",
    statusTag = "Lobby Online",
    title = "Pratique inglês em salas 3D em tempo real.",
    subtitle = "Entre no lobby, conecte-se com outros jogadores por voz e evolua sua conversação em um ambiente interativo.",
    imageSrc = "/auth-banner.png",
    imageAlt = "Ilustração 3D da Arena de Conversação",
    highlights = DEFAULT_BANNER_HIGHLIGHTS,
  } = props;

  return (
    <div
      style={{
        flex: 1.25,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 15,
        padding: "36px 38px",
        background: "#0b131d",
        borderRight: "1px solid rgba(88, 112, 138, 0.34)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.78,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10, 18, 28, 0.88) 0%, rgba(10, 18, 28, 0.24) 45%, rgba(10, 18, 28, 0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 1, justifyContent: "space-between", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#dfbe62",
              background: "rgba(10, 18, 28, 0.78)",
              border: "1px solid rgba(223, 190, 98, 0.42)",
              backdropFilter: "blur(8px)",
              padding: "6px 12px",
              borderRadius: 999
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#67d1bf",
                boxShadow: "0 0 8px #67d1bf",
              }}
            />
            {badge}
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(10, 18, 28, 0.78)",
              border: "1px solid rgba(103, 209, 191, 0.38)",
              backdropFilter: "blur(8px)",
              color: "#67d1bf",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {statusTag}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.16,
              letterSpacing: "-0.02em",
              color: "#e7edf5",
              textShadow: "0 4px 18px rgba(0, 0, 0, 0.65)",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(231, 237, 245, 0.85)",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.65)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${highlights.length}, 1fr)`,
          gap: 12,
          paddingTop: 18,
          borderTop: "1px solid rgba(88, 112, 138, 0.36)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {highlights.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: "rgba(16, 24, 32, 0.82)",
              border: "1px solid rgba(68, 80, 92, 0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(231, 237, 245, 0.62)",
              }}
            >
              {metric.label}
            </span>
            <strong
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: metric.accentColor,
              }}
            >
              {metric.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};
