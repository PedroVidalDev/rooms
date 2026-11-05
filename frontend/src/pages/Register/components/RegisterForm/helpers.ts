import type { RegisterFieldErrors, RegisterValidationResult } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterForm = (
  rawName: string,
  rawEmail: string,
  rawPassword: string,
): RegisterValidationResult => {
  const name = rawName.trim();
  const email = rawEmail.trim();
  const password = rawPassword;
  const errors: RegisterFieldErrors = {};

  if (!name) {
    errors.name = "Por favor, informe seu nome.";
  }

  if (!email) {
    errors.email = "Por favor, informe seu endereço de e-mail.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Por favor, informe um endereço de e-mail válido.";
  }

  if (!password) {
    errors.password = "Por favor, informe uma senha.";
  } else if (password.length < 6) {
    errors.password = "A senha deve ter pelo menos 6 caracteres.";
  }

  if (errors.name || errors.email || errors.password) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    payload: {
      name,
      email,
      password,
    },
  };
};
