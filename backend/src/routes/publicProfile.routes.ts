import { Router } from "express";

import { getPublicProfile } from "../controllers/publicProfile.controller.js";

const router = Router();

router.get('/:username', getPublicProfile);

export default router;