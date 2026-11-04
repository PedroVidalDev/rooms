import { inject, injectable } from "tsyringe";
import { User } from "../entities/user.entity.js";
import { UserModel } from "../../generated/prisma/models.js";
import { PrismaClient } from "../../generated/prisma/client.js";

@injectable()
export class UserRepository {
    constructor(
        @inject("PrismaClient")
        private readonly prisma: PrismaClient
    ) {}

    public async create(user: User): Promise<User> {
         const created: UserModel = await this.prisma.user.create({
            data: {
                name: user.getName(),
                email: user.getEmail(),
                password: user.getPassword(),
                isActive: user.getIsActive(),
                isVerified: user.getIsVerified(),
            },
        });

        return User.fromModel(created);
    }
}