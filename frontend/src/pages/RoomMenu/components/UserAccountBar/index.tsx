import { Button } from "../../../../components/Button";
import { getUserInitials } from "./helpers";
import type { UserAccountBarProps } from "./types";

export const UserAccountBar = (props: UserAccountBarProps) => {
  const { name, email, onOpenAccountDetails } = props;

  const displayName = name?.trim() || "Jogador Conectado";
  const displayEmail = email?.trim() || "Conta autenticada";
  const initials = getUserInitials(name, email);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#1d232b",
        border: "1px solid #44505c",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(103, 209, 191, 0.16)",
            border: "1px solid rgba(103, 209, 191, 0.42)",
            color: "#67d1bf",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 0,
          }}
        >
          <strong
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#e7edf5",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayName}
          </strong>
          <span
            style={{
              fontSize: 11,
              color: "rgba(231, 237, 245, 0.58)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayEmail}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onOpenAccountDetails}
        style={{
          padding: "8px 12px",
          fontSize: 12,
          borderRadius: 8,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Detalhes da Conta
      </Button>
    </div>
  );
};
