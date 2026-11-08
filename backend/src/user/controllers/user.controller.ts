import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service.js";

@injectable()
export class UserController {
    constructor(
        @inject("UserService")
        private readonly userService: UserService
    ) {}

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.register(req.body);
            res.status(201).json(user);
        } catch {
            res.status(500).json({ message: "Error registering user" });
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        try {
            const authenticatedUserId = Number(req.user?.sub);
            const targetUserId = Number(req.params.id);

            const result = await this.userService.update(
                authenticatedUserId,
                targetUserId,
                req.body
            );

            res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error updating user";
            const status = message.startsWith("Forbidden") ? 403 : 400;
            res.status(status).json({ message });
        }
    }
}
