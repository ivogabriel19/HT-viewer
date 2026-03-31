import { Router } from "express"
import * as teamController from "../controllers/team.controller"

const router = Router()

router.get("/", teamController.getTeams)
router.get("/summary", teamController.getTeamSummary)

export default router