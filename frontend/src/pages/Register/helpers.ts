import { client } from "../../colyseus/client";
import type { RegisterPayload, RegisterResponse } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterName = (rawName: string): string | null => {
  if (!rawName.trim()) {
    return "Por favor, informe seu nome.";
  }

  return null;
};

export const validateRegisterEmail = (rawEmail: string): string | null => {
  const email = rawEmail.trim();

  if (!email) {
    return "Por favor, informe seu endereço de e-mail.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Por favor, informe um endereço de e-mail válido.";
  }

  return null;
};

export const validateRegisterPassword = (rawPassword: string): string | null => {
  if (!rawPassword) {
    return "Por favor, informe uma senha.";
  }

  if (rawPassword.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  return null;
};

export const formatRegisterError = (err: unknown): string => {
  const status =
    (err as { status?: number; code?: number } | null)?.status ??
    (err as { status?: number; code?: number } | null)?.code;

  if (status === 400) {
    return "Dados inválidos. Verifique seu nome, e-mail e se a senha possui no mínimo 6 caracteres.";
  }

  if (status === 500) {
    return "Não foi possível criar a conta. Verifique se este e-mail já está cadastrado.";
  }

  return "Ocorreu um erro ao realizar o cadastro. Tente novamente.";
};

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await client.http.post("/auth/register", {
    body: {
      name: payload.name.trim(),
      email: payload.email.trim(),
      password: payload.password,
    },
  });

  return response.data as RegisterResponse;
};
