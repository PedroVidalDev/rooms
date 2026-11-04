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
}