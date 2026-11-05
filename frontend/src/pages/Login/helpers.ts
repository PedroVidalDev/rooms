import { client } from "../../colyseus/client";
import type { LoginLocationState, LoginPayload, LoginResponse } from "./types";

export const AUTH_TOKEN_STORAGE_KEY = "rooms@token";

export const extractLoginLocationState = (state: unknown): LoginLocationState => {
  const parsed = (state as LoginLocationState | null) ?? {};
  return {
    error: parsed.error,
    successMessage: parsed.successMessage,
    registeredEmail: parsed.registeredEmail,
  };
};

export const extractAuthToken = (data: LoginResponse): string | null => {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === "object" && typeof data.token === "string" && data.token.trim()) {
    return data.token.trim();
  }

  return null;
};

export const saveAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  client.auth.token = token;
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

export const loginUser = async (payload: LoginPayload): Promise<string> => {
  const response = await client.http.post("/auth/login", {
    body: {
      email: payload.email.trim(),
      password: payload.password,
    },
  });

  const token = extractAuthToken(response.data as LoginResponse);
  if (!token) {
    throw new Error("Token de autenticação não recebido.");
  }

  return token;
};
