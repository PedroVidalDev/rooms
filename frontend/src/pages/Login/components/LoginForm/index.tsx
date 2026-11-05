import { useState } from "react";
import { Button } from "../../../../components/Button";
import { TextInput } from "../../../../components/TextInput";
import { validateLoginForm } from "./helpers";
import type { LoginFieldErrors, LoginFormProps } from "./types";

export const LoginForm = (props: LoginFormProps) => {
  const { initialEmail = "", isSubmitting = false, onSubmit } = props;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    onSubmit(validation.payload);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <TextInput
        id="login-email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        disabled={isSubmitting}
        error={fieldErrors.email}
        onChange={handleEmailChange}
      />

      <TextInput
        id="login-password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        placeholder="Digite sua senha (mín. 6 caracteres)"
        value={password}
        disabled={isSubmitting}
        error={fieldErrors.password}
        onChange={handlePasswordChange}
      />

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
