import { inject, injectable } from "tsyringe";
import { PrismaClient } from "../../generated/prisma/client.js";
import {
    UserVerificationCodeModel,
    UserVerificationCodeUpdateInput,
    UserVerificationCodeWhereInput,
} from "../../generated/prisma/models.js";
import { UserVerificationCode } from "../entities/userVerificationCode.entity.js";

@injectable()
export class UserVerificationCodeRepository {
    constructor(
        @inject("PrismaClient")
        private readonly prisma: PrismaClient
    ) {}

    public async create(verificationCode: UserVerificationCode): Promise<UserVerificationCode> {
        const created: UserVerificationCodeModel = await this.prisma.userVerificationCode.create({
            data: {
                userId: verificationCode.getUserId(),
                hashedCode: verificationCode.getHashedCode(),
                used: verificationCode.getUsed(),
                expiresAt: verificationCode.getExpiresAt(),
            },
        });

        return UserVerificationCode.fromModel(created);
    }

    public async findBy(where: UserVerificationCodeWhereInput): Promise<UserVerificationCode | null> {
        const found: UserVerificationCodeModel | null = await this.prisma.userVerificationCode.findFirst({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!found) {
            return null;
        }

        return UserVerificationCode.fromModel(found);
    }

    public async update(id: number, data: UserVerificationCodeUpdateInput): Promise<UserVerificationCode> {
        const updated: UserVerificationCodeModel = await this.prisma.userVerificationCode.update({
            where: { id },
            data,
        });

        return UserVerificationCode.fromModel(updated);
    }

    public async invalidateUserCodes(userId: number): Promise<void> {
        await this.prisma.userVerificationCode.updateMany({
            where: {
                userId,
                used: false,
            },
            data: {
                used: true,
            },
        });
    }
}
