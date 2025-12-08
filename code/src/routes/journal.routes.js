/**
 * Journal Routes
 *
 * Routes for the Personal Journal feature
 */

import { Router } from "express";
import * as journalController from "../controllers/journal.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", journalController.getJournalPage);
router.post("/", journalController.createJournalEntry);
router.put("/:id", journalController.updateJournalEntry);
router.delete("/:id", journalController.deleteJournalEntry);

export default router;
