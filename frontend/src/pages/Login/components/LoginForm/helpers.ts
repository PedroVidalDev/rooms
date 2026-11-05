import type { LoginValidationResult } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = (
  rawEmail: string,
  rawPassword: string,
): LoginValidationResult => {
  const email = rawEmail.trim();
  const password = rawPassword;

  if (!email) {
    return {
      valid: false,
      error: "Por favor, informe seu endereço de e-mail.",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      error: "Por favor, informe um endereço de e-mail válido.",
    };
  }

  if (!password) {
    return {
      valid: false,
      error: "Por favor, informe sua senha.",
    };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: "A senha deve ter pelo menos 6 caracteres.",
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
