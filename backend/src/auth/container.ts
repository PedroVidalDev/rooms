import { container } from "tsyringe";
import { AuthService } from "./services/auth.service.js";

container.register("AuthService", { useClass: AuthService });