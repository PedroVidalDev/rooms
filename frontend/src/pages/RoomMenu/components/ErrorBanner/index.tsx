import type { ErrorBannerProps } from "./types";

export const ErrorBanner = (props: ErrorBannerProps) => {
  const { message, onDismiss } = props;

  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(217, 107, 107, 0.14)",
        border: "1px solid rgba(217, 107, 107, 0.48)",
        color: "#f5b5b5",
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
          style={{
            border: "none",
            background: "transparent",
            color: "#f5b5b5",
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
