import { container } from "tsyringe";
import { UserService } from "./services/user.service.js";
import { UserRepository } from "./repositories/user.repository.js";

container.register("UserService", { useClass: UserService });
container.register("UserRepository", { useClass: UserRepository });