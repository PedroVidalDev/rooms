import type { LoginLocationState } from "./types";

export const extractLoginLocationState = (state: unknown): LoginLocationState => {
  const parsed = (state as LoginLocationState | null) ?? {};
  return {
    error: parsed.error,
    successMessage: parsed.successMessage,
    registeredEmail: parsed.registeredEmail,
  };
};

export const formatLoginError = (err: unknown): string => {
  const status =
    (err as { status?: number; code?: number } | null)?.status ??
    (err as { status?: number; code?: number } | null)?.code;

  if (status === 401) {
    return "E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.";
  }

  if (status === 400) {
    return "Dados inválidos. Confira o formato do e-mail e a senha informada.";
  }

  return "Não foi possível entrar na sua conta no momento. Tente novamente.";
};
