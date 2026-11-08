import { useEffect, useState } from "react";
import type { AuthProviderProps, LoginResponse, UserData } from "./types";
import { AuthContext } from ".";
import { client } from "../../colyseus/client";
import { decodeAuthToken, getAuthToken, removeAuthToken, saveAuthToken } from "../../storage/authToken";

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [authUser, setAuthUser] = useState<UserData | null>(() => {
        const token = getAuthToken();
        if (!token) return null;

        client.auth.token = token;
        const decodedInfo = decodeAuthToken(token);
        return {
            email: decodedInfo.email,
            name: decodedInfo.name,
        };
    });

    const login = async (email: string, password: string) => {
        const response = await client.http.post("/auth/login", {
            body: {
                email: email.trim(),
                password: password,
            },
        });
        
        const res = response.data as LoginResponse;
        const token = res.token;
        if (!token) {
            throw new Error("Token de autenticação não recebido.");
        }

        saveAuthToken(token);

        const decodedInfo = decodeAuthToken(token);
        setAuthUser({
            email: decodedInfo.email,
            name: decodedInfo.name,
        });
    }

    const logout = () => {
        setAuthUser(null);
        removeAuthToken();
    }

    useEffect(() => {
        const token = getAuthToken();

        if (!token) {
            setAuthUser(null);
            return;
        }

        client.auth.token = token;

        const decodedInfo = decodeAuthToken(token);
        setAuthUser({
            email: decodedInfo.email,
            name: decodedInfo.name,
        });
    }, [])

    return (
        <AuthContext.Provider value={{ authUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}