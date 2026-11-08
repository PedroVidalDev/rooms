import { container } from "tsyringe";
import { UserService } from "./services/user.service.js";
import { UserRepository } from "./repositories/user.repository.js";
import { UserVerificationCodeRepository } from "./repositories/userVerificationCode.repository.js";
import { UserVerificationCodeService } from "./services/userVerificationCode.service.js";

container.register("UserService", { useClass: UserService });
container.register("UserRepository", { useClass: UserRepository });
container.register("UserVerificationCodeRepository", { useClass: UserVerificationCodeRepository });
container.register("UserVerificationCodeService", { useClass: UserVerificationCodeService });