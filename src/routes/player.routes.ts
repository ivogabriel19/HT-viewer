import { Router } from "express"
import * as playerController from "../controllers/player.controller"

const router = Router()

router.get("/", playerController.getPlayers)
router.get("/analysis", playerController.getPlayersAnalysis)
router.get("/lineup", playerController.getLineup)

export default router