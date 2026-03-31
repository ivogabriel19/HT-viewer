import { xmlToJson } from "../utils/xmlToJson"
import { readXmlFile } from "../utils/readXmlFile"

export const getPlayers = () => {
  const xmlData = readXmlFile("data/players.xml")

  const parsed = xmlToJson<any>(xmlData)

  const players = parsed?.HattrickData?.Team?.PlayerList?.Player

  if (!players) {
    throw new Error("Players not found in XML")
  }

  return Array.isArray(players) ? players : [players]
}

type Player = any

const weights = {
  GK: { KeeperSkill: 1.0, DefenderSkill: 0.3, SetPiecesSkill: 0.2 },
  DEF: { DefenderSkill: 1.0, PlaymakerSkill: 0.4, PassingSkill: 0.3 },
  MID: { PlaymakerSkill: 1.0, PassingSkill: 0.5, StaminaSkill: 0.3 },
  WING: { WingerSkill: 1.0, PassingSkill: 0.4, PlaymakerSkill: 0.3 },
  FW: { ScorerSkill: 1.0, PassingSkill: 0.4, WingerSkill: 0.3 }
}

const formations = {
  "4-4-2": { GK: 1, DEF: 4, MID: 4, FW: 2 },
  "3-5-2": { GK: 1, DEF: 3, MID: 5, FW: 2 },
  "4-3-3": { GK: 1, DEF: 4, MID: 3, FW: 3 }
}

const calculateRating = (player: Player, position: keyof typeof weights) => {
  const w = weights[position]

  return Object.entries(w).reduce((acc, [skill, weight]) => {
    return acc + (Number(player[skill]) || 0) * weight
  }, 0)
}

export const getPlayersWithAnalysis = () => {
  const xmlData = readXmlFile("data/players.xml")
  const parsed = xmlToJson<any>(xmlData)

  const raw = parsed?.HattrickData?.Team?.PlayerList?.Player
  const players = Array.isArray(raw) ? raw : [raw]

  return players.map((p: any) => {
    const ratings = {
      GK: calculateRating(p, "GK"),
      DEF: calculateRating(p, "DEF"),
      MID: calculateRating(p, "MID"),
      WING: calculateRating(p, "WING"),
      FW: calculateRating(p, "FW")
    }

    const bestPositionEntry = Object.entries(ratings).reduce((best, curr) =>
      curr[1] > best[1] ? curr : best
    )

    const bestPosition = bestPositionEntry[0]
    const bestRating = bestPositionEntry[1]

    return {
      ...p,
      analysis: {
        ratings,
        bestPosition,
        bestRating,
        role: getRole(p, bestPosition)
      }
    }
  })
}

export const buildLineup = (formation: string) => {
  const formations = {
    "4-4-2": { GK: 1, DEF: 4, MID: 4, FW: 2 },
    "3-5-2": { GK: 1, DEF: 3, MID: 5, FW: 2 },
    "4-3-3": { GK: 1, DEF: 4, MID: 3, FW: 3 }
  }

  const players = getPlayersWithAnalysis()

  const structure = formations[formation as keyof typeof formations]

  // 🧠 pool global (para no repetir jugadores)
  const available = [...players]

  // 🧠 generar candidatos por posición
  const getBestForPosition = (pos: keyof typeof structure, count: number) => {
    const selected: any[] = []

    for (let i = 0; i < count; i++) {
      if (available.length === 0) break

      // ordenar por rating en esa posición
      available.sort(
        (a, b) => b.analysis.ratings[pos] - a.analysis.ratings[pos]
      )

      const best = available.shift()
      if (best) selected.push(best)
    }

    return selected
  }

  // ⚠️ ORDEN IMPORTA
  // primero GK, después DEF, MID, FW
  const lineup = {
    GK: getBestForPosition("GK", structure.GK),
    DEF: getBestForPosition("DEF", structure.DEF),
    MID: getBestForPosition("MID", structure.MID),
    FW: getBestForPosition("FW", structure.FW)
  }

  const flatPlayers = [
    ...lineup.GK,
    ...lineup.DEF,
    ...lineup.MID,
    ...lineup.FW
  ]

  const chemistry = calculateTeamChemistry(flatPlayers)

  return { formation, lineup, chemistry }
}

const getRole = (p: any, bestPosition: string) => {
  const {
    DefenderSkill,
    WingerSkill,
    PlaymakerSkill,
    ScorerSkill
  } = p

  if (bestPosition === "DEF") {
    if (WingerSkill > DefenderSkill) return "Lateral"
    return "Central"
  }

  if (bestPosition === "MID") {
    if (WingerSkill > PlaymakerSkill) return "Extremo"
    return "Interior"
  }

  if (bestPosition === "FW") {
    if (WingerSkill > ScorerSkill) return "Delantero abierto"
    return "Delantero"
  }

  if (bestPosition === "GK") return "Arquero"

  return "Jugador"
}

const getChemistry = (a: any, b: any) => {
  let score = 0

  if (a.CountryID === b.CountryID) score += 2
  if (a.TeamID === b.TeamID) score += 1
  if (Math.abs(a.Age - b.Age) < 3) score += 1

  return score
}

export const calculateTeamChemistry = (players: any[]) => {
  let total = 0

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      total += getChemistry(players[i], players[j])
    }
  }

  return total
}