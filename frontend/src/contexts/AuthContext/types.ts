export type AuthContextProps = {
    authUser: UserData | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export type AuthProviderProps = {
    children: React.ReactNode;
}

export type UserData = {
    name: string;
    email: string;
}

export type LoginResponse = { token: string };
