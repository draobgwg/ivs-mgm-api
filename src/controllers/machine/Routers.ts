import { Router } from "express";
import VendController from "./VendController";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

/**
 * GET /vend-status
 * Returns the current vend state.
 * Query Params: authorization=<token>
 */
router.get("/vend-status", VendController.status);

/**
 * POST /vend-complete
 * Resets vend state to 0 (idle).
 * Body: { "vend-complete": 1 }
 * Query Params: authorization=<token>
 */


router.post("/vend-complete", VendController.complete);

export default router;
