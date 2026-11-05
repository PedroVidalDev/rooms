import { useState, type CSSProperties } from "react";
import { Button } from "../../../../components/Button";
import { validateLoginForm } from "./helpers";
import type { LoginFormProps } from "./types";

const LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#e7edf5",
  opacity: 0.75,
};

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #44505c",
  background: "#1d232b",
  color: "#e7edf5",
  padding: "11px 12px",
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

export const LoginForm = (props: LoginFormProps) => {
  const {
    initialEmail = "",
    isSubmitting = false,
    onSubmit,
    onValidationError,
  } = props;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      onValidationError?.(validation.error);
      return;
    }

    onSubmit(validation.payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="login-email" style={LABEL_STYLE}>
          E-mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          disabled={isSubmitting}
          onChange={(e) => setEmail(e.target.value)}
          style={INPUT_STYLE}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="login-password" style={LABEL_STYLE}>
          Senha
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha (mín. 6 caracteres)"
          value={password}
          disabled={isSubmitting}
          onChange={(e) => setPassword(e.target.value)}
          style={INPUT_STYLE}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting}
        style={{ marginTop: 4, fontSize: 15 }}
      >
        {isSubmitting ? "Entrando..." : "Entrar na Arena"}
      </Button>
    </form>
  );
};
