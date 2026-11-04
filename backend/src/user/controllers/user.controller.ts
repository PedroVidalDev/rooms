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
        await this.userService.register(req.body);
        res.json({ status: 201, message: 'User registered successfully' });
    }
}