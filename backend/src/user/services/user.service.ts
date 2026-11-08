import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/user.repository.js";
import { User } from "../entities/user.entity.js";
import { UserCreateDtoType } from "../dtos/userCreate.dto.js";
import { UserUpdateDtoType } from "../dtos/userUpdate.dto.js";
import { UserDtoType } from "../dtos/user.dto.js";
import { UserUpdateInput } from "../../generated/prisma/models.js";
import bcrypt from "bcrypt";
import { UserVerificationCodeService } from "./userVerificationCode.service.js";

@injectable()
export class UserService {

    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository,
        @inject("UserVerificationCodeService")
        private readonly userVerificationCodeService: UserVerificationCodeService
    ) {}

    public async register(data: UserCreateDtoType): Promise<UserDtoType> {
        const existingUser = await this.userRepository.findBy({ email: data.email });
        if (existingUser) {
            throw new Error("User with this email already exists"); 
        }

        const hashedPassword = await bcrypt.hash(data.password, 16);

        const user = new User(
            null,
            data.name,
            data.email,
            hashedPassword,
            new Date(),
            new Date(),
            null,
            true,
            false
        );

        const createdUser = await this.userRepository.create(user);

        await this.userVerificationCodeService.sendVerificationCode(createdUser);

        return createdUser.toDto();
    }

    public async update(
        authenticatedUserId: number,
        targetUserId: number,
        data: UserUpdateDtoType
    ): Promise<UserDtoType> {
        if (!authenticatedUserId || !targetUserId || authenticatedUserId !== targetUserId) {
            throw new Error("Forbidden: you can only update your own account");
        }

        const user = await this.userRepository.findBy({ id: targetUserId });
        if (!user || !user.getId()) {
            throw new Error("User not found");
        }

        const updatePayload: UserUpdateInput = {
            isVerified: false,
        };

        if (data.name !== undefined) {
            updatePayload.name = data.name.trim();
        }

        if (data.email !== undefined) {
            const trimmedEmail = data.email.trim();
            if (trimmedEmail.toLowerCase() !== user.getEmail().toLowerCase()) {
                const existingUser = await this.userRepository.findBy({ email: trimmedEmail });
                if (existingUser && existingUser.getId() !== user.getId()) {
                    throw new Error("User with this email already exists");
                }

                updatePayload.email = trimmedEmail;
            }
        }

        if (data.password !== undefined) {
            if (!data.currentPassword) {
                throw new Error("Current password is required");
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                data.currentPassword,
                user.getPassword()
            );
            if (!isCurrentPasswordValid) {
                throw new Error("Invalid current password");
            }

            updatePayload.password = await bcrypt.hash(data.password, 16);
        }

        const updatedUser = await this.userRepository.update(targetUserId, updatePayload);

        await this.userVerificationCodeService.sendVerificationCode(updatedUser);

        return updatedUser.toDto();
    }
}
