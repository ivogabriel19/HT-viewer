import { Router } from "express"
import teamRoutes from "./team.routes"
import playerRoutes from "./player.routes"
import { requireAuth } from "../middleware/auth.middleware"
import { fetchFromChpp } from "../utils/hattrickClient"

const router = Router()

router.use(requireAuth)

router.get("/debug/raw", async (req, res) => {
  const { accessToken, accessTokenSecret } = req.htToken!
  const file = (req.query.file as string) || "teamdetails"
  const xml = await fetchFromChpp(file, accessToken, accessTokenSecret)
  const { xmlToJson } = await import("../utils/xmlToJson")
  res.json(xmlToJson(xml))
})

router.use("/team", teamRoutes)
router.use("/player", playerRoutes)

export default router
