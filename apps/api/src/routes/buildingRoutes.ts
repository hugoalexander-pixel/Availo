import { Router } from 'express';
import { BuildingController } from '../controllers/buildingController';
import { authMiddleware, pengelolaOnly } from '../middleware/authMiddleware';

const router = Router();
const controller = new BuildingController();

router.get('/', authMiddleware, (req, res) => controller.list(req, res));
router.post('/', authMiddleware, pengelolaOnly, (req, res) => controller.create(req, res));

export { router as buildingRoutes };
