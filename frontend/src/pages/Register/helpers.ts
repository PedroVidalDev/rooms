import { client } from "../../colyseus/client";
import type { RegisterPayload, RegisterResponse } from "./types";

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
