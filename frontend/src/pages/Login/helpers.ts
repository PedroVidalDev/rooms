import type { LoginLocationState } from "./types";

export const extractLoginLocationState = (state: unknown): LoginLocationState => {
  const parsed = (state as LoginLocationState | null) ?? {};
  return {
    error: parsed.error,
    successMessage: parsed.successMessage,
    registeredEmail: parsed.registeredEmail,
    requiresVerification: parsed.requiresVerification,
  };
};

export const isUnverifiedLoginError = (err: unknown): boolean => {
  const status =
    (err as { status?: number; code?: number } | null)?.status ??
    (err as { status?: number; code?: number } | null)?.code;

  return status === 403;
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

export const formatVerificationError = (err: unknown): string => {
  const status =
    (err as { status?: number; code?: number } | null)?.status ??
    (err as { status?: number; code?: number } | null)?.code;

  if (status === 400) {
    return "Código inválido ou expirado. Verifique os 6 dígitos enviados para o seu e-mail.";
  }

  return "Não foi possível verificar o código no momento. Tente novamente.";
};
