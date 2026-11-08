import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AuthService } from "../services/auth.service.js";

@injectable()
export class AuthController {
    constructor(
        @inject("AuthService")
        private readonly authService: AuthService
    ) {}

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.login(req.body);
            if (!result.isVerified) {
                res.status(403).json({
                    isVerified: false,
                    message: "Account not verified. A verification code has been sent to your email.",
                });
                return;
            }

            res.status(200).json({ token: result.token, isVerified: true });
        } catch {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }

    public async verify(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.verifyCode(req.body);
            res.status(200).json({
                token: result.token,
                isVerified: result.isVerified,
                message: "Account verified successfully",
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid or expired verification code";
            res.status(400).json({ message });
        }
    }
}