import { Router } from "express"
import * as authController from "../controllers/auth.controller"

const router = Router()

router.get("/login", authController.login)
router.get("/callback", authController.callback)
router.post("/logout", authController.logout)
router.get("/status", authController.status)

export default router