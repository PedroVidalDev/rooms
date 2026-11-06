import { jwtDecode } from "jwt-decode";
import { client } from "../colyseus/client";

type AuthTokenPayload = {
    email: string;
    name: string;
    exp: number;
    iat: number;
    sub: string;
};

export const AUTH_TOKEN_STORAGE_KEY = "rooms@token";

export const saveAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  client.auth.token = token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  client.auth.token = "";
};

export const decodeAuthToken = (token: string) => {
    const decoded = jwtDecode<AuthTokenPayload>(token);

    return decoded;
}