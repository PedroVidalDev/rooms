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
            const { token } = await this.authService.login(req.body);
            res.status(200).json({ token });
        } catch {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }
}