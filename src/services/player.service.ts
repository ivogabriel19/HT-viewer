import { xmlToJson } from "../utils/xmlToJson"
import { fetchFromChpp } from "../utils/hattrickClient"
import { HtTokenPayload } from "../middleware/auth.middleware"

const weights = {
  GK:   { KeeperSkill: 1.0, DefenderSkill: 0.3, SetPiecesSkill: 0.2 },
  DEF:  { DefenderSkill: 1.0, PlaymakerSkill: 0.4, PassingSkill: 0.3 },
  MID:  { PlaymakerSkill: 1.0, PassingSkill: 0.5, StaminaSkill: 0.3 },
  WING: { WingerSkill: 1.0, PassingSkill: 0.4, PlaymakerSkill: 0.3 },
  FW:   { ScorerSkill: 1.0, PassingSkill: 0.4, WingerSkill: 0.3 },
}

const formations = {
  "4-4-2": { GK: 1, DEF: 4, MID: 4, FW: 2 },
  "3-5-2": { GK: 1, DEF: 3, MID: 5, FW: 2 },
  "4-3-3": { GK: 1, DEF: 4, MID: 3, FW: 3 },
}

const calculateRating = (player: any, position: keyof typeof weights) => {
  const w = weights[position]
  return Object.entries(w).reduce((acc, [skill, weight]) => {
    return acc + (Number(player[skill]) || 0) * weight
  }, 0)
}

const getRole = (p: any, bestPosition: string): string => {
  const { DefenderSkill, WingerSkill, PlaymakerSkill, ScorerSkill } = p
  if (bestPosition === "DEF")  return WingerSkill > DefenderSkill ? "Lateral" : "Central"
  if (bestPosition === "MID")  return WingerSkill > PlaymakerSkill ? "Extremo" : "Interior"
  if (bestPosition === "FW")   return WingerSkill > ScorerSkill ? "Delantero abierto" : "Delantero"
  if (bestPosition === "GK")   return "Arquero"
  if (bestPosition === "WING") return "Extremo"
  return "Jugador"
}

const getChemistry = (a: any, b: any): number => {
  let score = 0
  if (a.CountryID !== undefined && a.CountryID === b.CountryID) score += 2
  if (Math.abs(Number(a.Age) - Number(b.Age)) < 3) score += 1
  return score
}

export const calculateTeamChemistry = (players: any[]): number => {
  let total = 0
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      total += getChemistry(players[i], players[j])
    }
  }
  return total
}

export const getPlayers = async ({ accessToken, accessTokenSecret }: HtTokenPayload) => {
  const xmlData = await fetchFromChpp("players", accessToken, accessTokenSecret)
  const parsed = xmlToJson<any>(xmlData)
  const players = parsed?.HattrickData?.Team?.PlayerList?.Player
  if (!players) throw new Error("Players not found in API response")
  return Array.isArray(players) ? players : [players]
}

export const getPlayersWithAnalysis = async (token: HtTokenPayload) => {
  const players = await getPlayers(token)

  return players.map((p: any) => {
    const ratings = {
      GK:   calculateRating(p, "GK"),
      DEF:  calculateRating(p, "DEF"),
      MID:  calculateRating(p, "MID"),
      WING: calculateRating(p, "WING"),
      FW:   calculateRating(p, "FW"),
    }

    const [bestPosition, bestRating] = Object.entries(ratings).reduce((best, curr) =>
      curr[1] > best[1] ? curr : best
    )

    return {
      ...p,
      analysis: { ratings, bestPosition, bestRating, role: getRole(p, bestPosition) },
    }
  })
}

export const buildLineup = async (formation: string, token: HtTokenPayload) => {
  const structure = formations[formation as keyof typeof formations]
  if (!structure) throw new Error(`Unsupported formation: ${formation}`)

  const players = await getPlayersWithAnalysis(token)
  const available = [...players]

  const getBestForPosition = (pos: keyof typeof structure, count: number) => {
    const selected: any[] = []
    for (let i = 0; i < count; i++) {
      if (available.length === 0) break
      available.sort((a, b) => b.analysis.ratings[pos] - a.analysis.ratings[pos])
      const best = available.shift()
      if (best) selected.push(best)
    }
    return selected
  }

  const lineup = {
    GK:  getBestForPosition("GK",  structure.GK),
    DEF: getBestForPosition("DEF", structure.DEF),
    MID: getBestForPosition("MID", structure.MID),
    FW:  getBestForPosition("FW",  structure.FW),
  }

  const flatPlayers = [...lineup.GK, ...lineup.DEF, ...lineup.MID, ...lineup.FW]
  return { formation, lineup, chemistry: calculateTeamChemistry(flatPlayers) }
}
