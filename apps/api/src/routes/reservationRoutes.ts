import { Router } from 'express';
import { ReservationController } from '../controllers/reservationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = new ReservationController();

router.post('/', authMiddleware, (req, res) => controller.create(req, res));
router.get('/my', authMiddleware, (req, res) => controller.getMyReservations(req, res));
router.get('/:Id', authMiddleware, (req, res) => controller.getById(req, res));
router.patch('/:Id/cancel', authMiddleware, (req, res) => controller.cancel(req, res));
router.patch('/:Id/early-end', authMiddleware, (req, res) => controller.earlyEnd(req, res));

export { router as reservationRoutes };
