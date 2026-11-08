import { inject, injectable } from "tsyringe";
import { UserRepository } from "../../user/repositories/user.repository.js";
import { UserVerificationCodeService } from "../../user/services/userVerificationCode.service.js";
import { User } from "../../user/entities/user.entity.js";
import { LoginDtoType } from "../dtos/login.dto.js";
import { VerifyCodeDtoType } from "../dtos/verifyCode.dto.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

@injectable()
export class AuthService {
    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository,
        @inject("UserVerificationCodeService")
        private readonly userVerificationCodeService: UserVerificationCodeService
    ) {}

    private generateToken(user: User): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        return jwt.sign(
            {
                sub: user.getId(),
                email: user.getEmail(),
            },
            secret,
            { expiresIn: "1d" }
        );
    }

    public async login(data: LoginDtoType) {
        const user = await this.userRepository.findBy({ email: data.email });
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.getPassword());
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        if (!user.getIsVerified()) {
            await this.userVerificationCodeService.sendVerificationCode(user);
            return {
                isVerified: false,
                token: null,
            };
        }

        const token = this.generateToken(user);

        return {
            isVerified: true,
            token,
        };
    }

    public async verifyCode(data: VerifyCodeDtoType) {
        const user = await this.userRepository.findBy({ email: data.email });
        if (!user || !user.getId()) {
            throw new Error("User not found");
        }

        await this.userVerificationCodeService.verifyUserCode(user.getId()!, data.code);

        const updatedUser = await this.userRepository.update(user.getId()!, {
            isVerified: true,
        });

        const token = this.generateToken(updatedUser);

        return {
            isVerified: true,
            token,
        };
    }
}