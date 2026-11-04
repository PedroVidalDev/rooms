import { inject, injectable } from "tsyringe";
import { UserRepository } from "../../user/repositories/user.repository.js";
import { LoginDtoType } from "../dtos/login.dto.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

@injectable()
export class AuthService {
    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository
    ) {}

    public async login(data: LoginDtoType) {
        const user = await this.userRepository.findBy({ email: data.email });
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.getPassword());
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            {
                sub: user.getId(),
                email: user.getEmail(),
            },
            secret,
            { expiresIn: "1d" }
        );

        return { token };
    }
}