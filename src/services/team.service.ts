import { xmlToJson } from "../utils/xmlToJson"
import { fetchFromChpp } from "../utils/hattrickClient"
import { HtTokenPayload } from "../middleware/auth.middleware"

export const getTeams = async ({ accessToken, accessTokenSecret }: HtTokenPayload) => {
  const xmlData = await fetchFromChpp("teamdetails", accessToken, accessTokenSecret)
  const parsed = xmlToJson<any>(xmlData)
  const teams = parsed?.HattrickData?.Team
  if (!teams) throw new Error("Teams not found in API response")
  return Array.isArray(teams) ? teams : [teams]
}

export const getTeamSummary = async (token: HtTokenPayload) => {
  const [teamXml, playersXml] = await Promise.all([
    fetchFromChpp("teamdetails", token.accessToken, token.accessTokenSecret),
    fetchFromChpp("players",     token.accessToken, token.accessTokenSecret),
  ])

  const team = xmlToJson<any>(teamXml)?.HattrickData?.Team
  const rawPlayers = xmlToJson<any>(playersXml)?.HattrickData?.Team?.PlayerList?.Player

  if (!team || !rawPlayers) throw new Error("Missing data from CHPP API")

  const players = Array.isArray(rawPlayers) ? rawPlayers : [rawPlayers]

  const topPlayer = players.reduce((max: any, p: any) =>
    Number(p.TSI) > Number(max.TSI) ? p : max
  )

  // CHPP players API doesn't include ArrivalDate — use highest PlayerID as proxy for most recent signing
  const newestPlayer = players.reduce((latest: any, p: any) =>
    Number(p.PlayerID) > Number(latest.PlayerID) ? p : latest
  )

  return { team, topPlayer, newestPlayer }
}
