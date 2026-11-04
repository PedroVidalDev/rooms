import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/user.repository.js";
import { User } from "../entities/user.entity.js";

@injectable()
export class UserService {

    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository
    ) {}

    public async register() {
        const user = new User(
            1,
            "John Doe",
            "john.doe@example.com",
            "password123",
            new Date(),
            new Date(),
            null,
            true,
            false
        );
        await this.userRepository.create(user);
    }
}