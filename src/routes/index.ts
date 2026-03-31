import { Router } from "express"
import teamRoutes from "./team.routes"
import playerRoutes from "./player.routes"

const router = Router()

router.use("/team", teamRoutes)
router.use("/player", playerRoutes)

export default router