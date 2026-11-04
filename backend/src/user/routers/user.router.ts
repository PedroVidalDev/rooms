import { Router } from 'express';
import { userController } from '../container.js';
import { validateData } from '../../middlewares/validationMiddleware.js';
import { UserCreateDto } from '../dtos/userCreate.dto.js';

const router = Router();

router.post('/register', validateData(UserCreateDto), (req, res) => userController.register(req, res));

export default router;