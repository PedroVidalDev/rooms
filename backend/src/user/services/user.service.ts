import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/user.repository.js";
import { User } from "../entities/user.entity.js";
import { UserCreateDtoType } from "../dtos/userCreate.dto.js";

@injectable()
export class UserService {

    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository
    ) {}

    public async register(data: UserCreateDtoType) {
        const user = new User(
            null,
            data.name,
            data.email,
            data.password,
            new Date(),
            new Date(),
            null,
            true,
            false
        );
        await this.userRepository.create(user);
    }
}