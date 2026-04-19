import dotenv from "dotenv"

dotenv.config()

export const env = {
  PORT: process.env.PORT || "3000",
  CHPP_CONSUMER_KEY: process.env.CHPP_CONSUMER_KEY!,
  CHPP_CONSUMER_SECRET: process.env.CHPP_CONSUMER_SECRET!,
  CHPP_CALLBACK_URL: process.env.CHPP_CALLBACK_URL || "http://localhost:3000/auth/callback",
  JWT_SECRET: process.env.JWT_SECRET || "change_this_in_production",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:4321",
}