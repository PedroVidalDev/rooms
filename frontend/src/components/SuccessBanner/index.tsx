import type { SuccessBannerProps } from "./types";

export const SuccessBanner = (props: SuccessBannerProps) => {
  const { message, onDismiss } = props;

  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(103, 209, 191, 0.14)",
        border: "1px solid rgba(103, 209, 191, 0.45)",
        color: "#8ed1c2",
        padding: "10px 12px",
        borderRadius: 10,
        fontSize: 13,
        lineHeight: 1.4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso de sucesso"
          style={{
            border: "none",
            background: "transparent",
            color: "#8ed1c2",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            padding: "0 4px",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
