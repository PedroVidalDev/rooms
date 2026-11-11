import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import { validateData } from '../../middlewares/validationMiddleware.js';
import { UserCreateDto } from '../dtos/userCreate.dto.js';
import { UserUpdateDto } from '../dtos/userUpdate.dto.js';
import { container } from 'tsyringe';
import { UserController } from '../controllers/user.controller.js';
import multer from 'multer';
import { attachSkinFileToBody } from '../../middlewares/attachSkinFileToBody.js';

const router = Router();
const userController = container.resolve(UserController);

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', validateData(UserCreateDto), (req, res) => userController.register(req, res));
router.put('/:id', authenticateToken, upload.single('skinFile'), attachSkinFileToBody, validateData(UserUpdateDto), (req, res) => userController.update(req, res));

export default router;
