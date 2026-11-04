import { User } from "../entities/user.entity.js";

export class UserRepository {
    public async create(user: User) {
        console.log("Creating a new user in the database...");
    }
}