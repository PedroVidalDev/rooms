import { createContext, useContext } from "react";
import { type AuthContextProps } from "./types";

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}