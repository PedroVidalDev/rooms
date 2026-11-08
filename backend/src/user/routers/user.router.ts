import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import { validateData } from '../../middlewares/validationMiddleware.js';
import { UserCreateDto } from '../dtos/userCreate.dto.js';
import { UserUpdateDto } from '../dtos/userUpdate.dto.js';
import { container } from 'tsyringe';
import { UserController } from '../controllers/user.controller.js';

const router = Router();
const userController = container.resolve(UserController);

router.post('/register', validateData(UserCreateDto), (req, res) => userController.register(req, res));
router.put('/:id', authenticateToken, validateData(UserUpdateDto), (req, res) => userController.update(req, res));

export default router;
