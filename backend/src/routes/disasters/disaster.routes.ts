import { Router } from "express";
import {
  createDisaster,
  getDisasters,
  getDisasterById,
  updateDisaster,
  deleteDisaster,
} from "../../controllers/disasters/disaster.controller";
import { authenticate, authorize } from "../../middleware/auth/auth.middleware";
import { getNearbyResources } from "../../controllers/disasters/resource.controller";
import { getDisasterReports } from "../../controllers/disasters/community-reports.controller";

const router = Router();

// Public read endpoints
router.get("/", getDisasters);
router.get("/:id/resources", getNearbyResources);
router.get("/:id/reports", getDisasterReports);
router.get("/:id", getDisasterById);

// Protected write endpoints
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "CONTRIBUTOR"),
  createDisaster,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "CONTRIBUTOR"),
  updateDisaster,
);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteDisaster);

export default router;
