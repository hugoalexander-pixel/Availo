import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = new NotificationController();

router.get('/', authMiddleware, (req, res) => controller.list(req, res));
router.patch('/:Id/read', authMiddleware, (req, res) => controller.markAsRead(req, res));
router.post('/watch', authMiddleware, (req, res) => controller.watchFacility(req, res));

export { router as notificationRoutes };
