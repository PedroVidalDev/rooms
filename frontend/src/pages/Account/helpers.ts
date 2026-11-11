import { client } from "../../colyseus/client";
import { decodeAuthToken, getAuthToken } from "../../storage/authToken";
import type {
  AccountFieldErrors,
  UpdateAccountPayload,
  UpdateAccountResponse,
} from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAuthenticatedUserId = (): number | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeAuthToken(token);
    const id = Number(decoded.sub);
    return Number.isNaN(id) ? null : id;
  } catch {
    return null;
  }
};

export const getAuthenticatedUserSkinUrl = (): string | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeAuthToken(token);
    return decoded.skinUrl ?? null;
  } catch {
    return null;
  }
};

export const resolveSkinUrl = (skinUrl?: string | null): string | undefined => {
  if (!skinUrl) {
    return undefined;
  }

  if (
    skinUrl.startsWith("http") ||
    skinUrl.startsWith("blob:") ||
    skinUrl.startsWith("data:")
  ) {
    return skinUrl;
  }

  const backendHttpUrl = (
    import.meta.env.VITE_WEBSOCKET_SERVER ?? "ws://localhost:8080"
  ).replace(/^ws/, "http");

  return `${backendHttpUrl}${skinUrl}`;
};

export const validateAccountForm = (
  currentName: string,
  currentEmail: string,
  name: string,
  email: string,
  currentPassword: string,
  newPassword: string,
):
  | { valid: true; payload: UpdateAccountPayload }
  | { valid: false; errors: AccountFieldErrors } => {
  const errors: AccountFieldErrors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    errors.name = "Informe seu nome.";
  }

  if (!trimmedEmail) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Informe um endereço de e-mail válido.";
  }

  if (newPassword || currentPassword) {
    if (!currentPassword) {
      errors.currentPassword = "Informe sua senha atual para alterar a senha.";
    } else if (currentPassword.length < 6) {
      errors.currentPassword = "A senha atual deve ter pelo menos 6 caracteres.";
    }

    if (!newPassword) {
      errors.password = "Informe a nova senha.";
    } else if (newPassword.length < 6) {
      errors.password = "A nova senha deve ter pelo menos 6 caracteres.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const payload: UpdateAccountPayload = {};

  if (trimmedName !== currentName.trim()) {
    payload.name = trimmedName;
  }

  if (trimmedEmail.toLowerCase() !== currentEmail.trim().toLowerCase()) {
    payload.email = trimmedEmail;
  }

  if (newPassword) {
    payload.currentPassword = currentPassword;
    payload.password = newPassword;
  }

  return { valid: true, payload };
};

export const updateUserAccount = async (
  userId: number,
  payload: UpdateAccountPayload,
): Promise<UpdateAccountResponse> => {
  const formData = new FormData();

  if (payload.name) formData.append("name", payload.name);
  if (payload.email) formData.append("email", payload.email);
  if (payload.currentPassword) formData.append("currentPassword", payload.currentPassword);
  if (payload.password) formData.append("password", payload.password);
  if (payload.skinFile) formData.append("skinFile", payload.skinFile);

  const response = await client.http.put(`/auth/${userId}`, {
    body: formData,
  });

  return response.data as UpdateAccountResponse;
};

export const formatAccountUpdateError = (err: unknown): string => {
  const errorData = (
    err as { data?: { message?: string }; message?: string; status?: number } | null
  );
  const backendMessage = errorData?.data?.message ?? errorData?.message ?? "";

  if (backendMessage.toLowerCase().includes("invalid current password")) {
    return "A senha atual informada está incorreta.";
  }

  if (backendMessage.toLowerCase().includes("email already exists")) {
    return "Este endereço de e-mail já está em uso por outra conta.";
  }

  if (errorData?.status === 403) {
    return "Você só tem permissão para alterar os dados da sua própria conta.";
  }

  return "Não foi possível atualizar os dados da conta. Verifique as informações e tente novamente.";
};
