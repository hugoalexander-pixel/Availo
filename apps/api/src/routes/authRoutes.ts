import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.get('/me', authMiddleware, (req, res) => controller.getMe(req, res));

export { router as authRoutes };
