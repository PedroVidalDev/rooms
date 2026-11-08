import { Router } from 'express';
import { validateData } from '../../middlewares/validationMiddleware.js';
import { LoginDto } from '../dtos/login.dto.js';
import { VerifyCodeDto } from '../dtos/verifyCode.dto.js';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/login', validateData(LoginDto), (req, res) => authController.login(req, res));
router.post('/verify', validateData(VerifyCodeDto), (req, res) => authController.verify(req, res));

export default router;