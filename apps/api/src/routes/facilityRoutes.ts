import { Router } from 'express';
import { FacilityController } from '../controllers/facilityController';
import { authMiddleware, pengelolaOnly } from '../middleware/authMiddleware';
import { ReservationController } from '../controllers/reservationController';

const router = Router();
const controller = new FacilityController();
const reservationController = new ReservationController();

router.get('/', authMiddleware, (req, res) => controller.list(req, res));
router.get('/:Id', authMiddleware, (req, res) => controller.getById(req, res));
router.post('/', authMiddleware, pengelolaOnly, (req, res) => controller.create(req, res));
router.put('/:Id', authMiddleware, pengelolaOnly, (req, res) => controller.update(req, res));
router.delete('/:Id', authMiddleware, pengelolaOnly, (req, res) => controller.delete(req, res));

router.get('/:Id/reservations', authMiddleware, (req, res) => reservationController.getFacilityReservations(req, res));

export { router as facilityRoutes };
