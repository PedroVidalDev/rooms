import { inject, injectable } from "tsyringe";
import { UserRepository } from "../../user/repositories/user.repository.js";
import { LoginDtoType } from "../dtos/login.dto.js";

@injectable()
export class AuthService {
    constructor(
        @inject("UserRepository")
        private readonly userRepository: UserRepository
    ) {}

    public async login(data: LoginDtoType) {
        return "tetetete";
    }
}