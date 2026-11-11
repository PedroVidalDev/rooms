import { TextInput } from "../../../../components/TextInput";
import type { PasswordChangeSectionProps } from "./types";

export const PasswordChangeSection = (props: PasswordChangeSectionProps) => {
  const {
    currentPassword,
    newPassword,
    currentPasswordError,
    newPasswordError,
    disabled = false,
    onCurrentPasswordChange,
    onNewPasswordChange,
  } = props;

  return (
    <div
      style={{
        padding: "22px",
        borderRadius: 14,
        background: "#151f2a",
        border: "1px solid rgba(88, 112, 138, 0.34)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#e7edf5",
          }}
        >
          Alterar Senha
        </h2>
        <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
          Preencha apenas se desejar alterar sua senha atual.
        </span>
      </div>

      <TextInput
        id="account-current-password"
        label="Senha Atual"
        type="password"
        autoComplete="current-password"
        placeholder="Digite sua senha atual"
        value={currentPassword}
        disabled={disabled}
        error={currentPasswordError}
        onChange={(e) => onCurrentPasswordChange(e.target.value)}
      />

      <TextInput
        id="account-new-password"
        label="Nova Senha"
        type="password"
        autoComplete="new-password"
        placeholder="Nova senha (mín. 6 caracteres)"
        value={newPassword}
        disabled={disabled}
        error={newPasswordError}
        onChange={(e) => onNewPasswordChange(e.target.value)}
      />
    </div>
  );
};
