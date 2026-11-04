import { Router } from 'express';
import { userController } from '../container.js';

const router = Router();

router.get('/register', (req, res) => userController.register(req, res));

export default router;