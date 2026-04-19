import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import routes from "./routes"
import authRoutes from "./routes/auth.routes"
import { env } from "./config/env"

const app = express()

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRoutes)
app.use("/api", routes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message)
  res.status(500).json({ error: err.message })
})

export default app