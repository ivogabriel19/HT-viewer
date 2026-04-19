import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"

export interface HtTokenPayload {
  accessToken: string
  accessTokenSecret: string
}

declare global {
  namespace Express {
    interface Request {
      htToken?: HtTokenPayload
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["ht_token"]

  if (!token) {
    res.status(401).json({
      error: "Not authenticated",
      loginUrl: "/auth/login",
    })
    return
  }

  try {
    req.htToken = jwt.verify(token, env.JWT_SECRET) as HtTokenPayload
    next()
  } catch {
    res.status(401).json({
      error: "Session expired",
      loginUrl: "/auth/login",
    })
  }
}