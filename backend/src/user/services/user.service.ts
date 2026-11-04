import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/user.repository.js";
import { User } from "../entities/user.entity.js";
import { UserCreateDtoType } from "../dtos/userCreate.dto.js";
import { UserDtoType } from "../dtos/user.dto.js";
import bcrypt from "bcrypt";

@injectable()
export class UserService {

    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository
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

        return createdUser.toDto();
    }
}