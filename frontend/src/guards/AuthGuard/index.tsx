import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import type { AuthGuardProps } from "./types";

export const AuthGuard = (props: AuthGuardProps) => {
    const { authUser } = useAuthContext();

    if (!authUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{props.children}</>;
}