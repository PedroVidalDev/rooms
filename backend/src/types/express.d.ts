import { JwtPayload } from "jsonwebtoken";

export interface UserJwtPayload extends JwtPayload {
    sub: string;
    email: string;
}

declare global {
    namespace Express {
    interface Request {
        user?: UserJwtPayload;
    }
    }
}