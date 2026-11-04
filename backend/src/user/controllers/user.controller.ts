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
        const user = await this.userService.register(req.body);
        res.status(201).json(user);
    }
}