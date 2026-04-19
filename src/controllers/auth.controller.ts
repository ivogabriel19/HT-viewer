import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { getRequestToken, exchangeForAccessToken, getAuthorizationUrl } from "../services/auth.service"
import { env } from "../config/env"

const TEMP_COOKIE = "ht_request_secret"
const AUTH_COOKIE = "ht_token"
const COOKIE_OPTS_BASE = { httpOnly: true, sameSite: "lax" as const }

export const login = async (_req: Request, res: Response) => {
  const { token, tokenSecret } = await getRequestToken()

  const tempJwt = jwt.sign({ requestTokenSecret: tokenSecret }, env.JWT_SECRET, { expiresIn: "10m" })
  res.cookie(TEMP_COOKIE, tempJwt, { ...COOKIE_OPTS_BASE, maxAge: 10 * 60 * 1000 })

  res.redirect(getAuthorizationUrl(token))
}

export const callback = async (req: Request, res: Response) => {
  const { oauth_token, oauth_verifier } = req.query as Record<string, string>
  const tempCookie = req.cookies[TEMP_COOKIE]

  if (!tempCookie || !oauth_token || !oauth_verifier) {
    res.status(400).json({ error: "Invalid OAuth callback parameters" })
    return
  }

  const { requestTokenSecret } = jwt.verify(tempCookie, env.JWT_SECRET) as { requestTokenSecret: string }
  const { accessToken, accessTokenSecret } = await exchangeForAccessToken(oauth_token, requestTokenSecret, oauth_verifier)

  const authJwt = jwt.sign({ accessToken, accessTokenSecret }, env.JWT_SECRET, { expiresIn: "30d" })

  res.clearCookie(TEMP_COOKIE)
  res.cookie(AUTH_COOKIE, authJwt, { ...COOKIE_OPTS_BASE, maxAge: 30 * 24 * 60 * 60 * 1000 })

  res.redirect(env.FRONTEND_URL)
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE)
  res.json({ success: true })
}

export const status = (req: Request, res: Response) => {
  const token = req.cookies[AUTH_COOKIE]
  if (!token) {
    res.json({ authenticated: false })
    return
  }
  try {
    jwt.verify(token, env.JWT_SECRET)
    res.json({ authenticated: true })
  } catch {
    res.json({ authenticated: false })
  }
}