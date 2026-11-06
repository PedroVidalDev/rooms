import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import type { AuthGuardProps } from "./types";

export const AuthGuard = (props: AuthGuardProps) => {
    const { authUser } = useAuthContext();
    const navigate = useNavigate();

    if (!authUser) {
        navigate("/login", { replace: true });
        return null;
    }

    return <>{props.children}</>;
}