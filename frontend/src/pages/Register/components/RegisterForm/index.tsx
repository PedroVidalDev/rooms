import { useState } from "react";
import { Button } from "../../../../components/Button";
import { TextInput } from "../../../../components/TextInput";
import { validateRegisterForm } from "./helpers";
import type { RegisterFieldErrors, RegisterFormProps } from "./types";

export const RegisterForm = (props: RegisterFormProps) => {
  const { isSubmitting = false, onSubmit } = props;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

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

    const validation = validateRegisterForm(name, email, password);
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
        id="register-name"
        label="Nome"
        type="text"
        autoComplete="name"
        placeholder="Como deseja ser chamado"
        value={name}
        disabled={isSubmitting}
        error={fieldErrors.name}
        onChange={handleNameChange}
      />

      <TextInput
        id="register-email"
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
        id="register-password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        placeholder="Crie uma senha (mín. 6 caracteres)"
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
        {isSubmitting ? "Criando conta..." : "Criar Conta"}
      </Button>
    </form>
  );
};
