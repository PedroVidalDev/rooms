import { TextInput } from "../../../../components/TextInput";
import type { PersonalDataSectionProps } from "./types";

export const PersonalDataSection = (props: PersonalDataSectionProps) => {
  const {
    name,
    email,
    nameError,
    emailError,
    disabled = false,
    onNameChange,
    onEmailChange,
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
          Dados Pessoais
        </h2>
        <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
          Altere seu nome ou e-mail. Ao confirmar a alteração, um novo código de verificação será enviado.
        </span>
      </div>

      <TextInput
        id="account-name"
        label="Nome"
        type="text"
        placeholder="Seu nome"
        value={name}
        disabled={disabled}
        error={nameError}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <TextInput
        id="account-email"
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        value={email}
        disabled={disabled}
        error={emailError}
        onChange={(e) => onEmailChange(e.target.value)}
      />
    </div>
  );
};
