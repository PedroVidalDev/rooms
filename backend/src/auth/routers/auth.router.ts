import { Router } from 'express';
import { validateData } from '../../middlewares/validationMiddleware.js';
import { LoginDto } from '../dtos/login.dto.js';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/login', validateData(LoginDto), (req, res) => authController.login(req, res));

export default router;