import express from "express"
import cors from "cors"
import routes from "./routes"

const app = express()

app.use(cors({
  origin: "http://localhost:4321"
}))
app.use(express.json())

app.use("/api", routes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

console.log("App initialized");

export default app