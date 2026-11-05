import type { LoginFieldErrors, LoginValidationResult } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = (
  rawEmail: string,
  rawPassword: string,
): LoginValidationResult => {
  const email = rawEmail.trim();
  const password = rawPassword;
  const errors: LoginFieldErrors = {};

  if (!email) {
    errors.email = "Por favor, informe seu endereço de e-mail.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Por favor, informe um endereço de e-mail válido.";
  }

  if (!password) {
    errors.password = "Por favor, informe sua senha.";
  } else if (password.length < 6) {
    errors.password = "A senha deve ter pelo menos 6 caracteres.";
  }

  if (errors.email || errors.password) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    payload: {
      email,
      password,
    },
  };
};
