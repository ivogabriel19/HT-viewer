import { Team } from "../types/team.types"
import { xmlToJson } from "../utils/xmlToJson"
import { readXmlFile } from "../utils/readXmlFile"

let teams: Team[] = []

export const getTeams = () => {
  const xmlData = readXmlFile("data/team.xml")

  const parsed = xmlToJson<any>(xmlData)

  const teams = parsed?.HattrickData?.Teams?.Team

  if (!teams) {
    throw new Error("Teams not found in XML")
  }

  return Array.isArray(teams) ? teams : [teams]
}

export const getTeamSummary = () => {
  // TEAM
  const teamXml = readXmlFile("data/team.xml")
  const teamParsed = xmlToJson<any>(teamXml)
  const team = teamParsed?.HattrickData?.Teams?.Team

  // PLAYERS
  const playersXml = readXmlFile("data/players.xml")
  const playersParsed = xmlToJson<any>(playersXml)
  const rawPlayers = playersParsed?.HattrickData?.Team?.PlayerList?.Player

  const players = Array.isArray(rawPlayers) ? rawPlayers : [rawPlayers]

  if (!team || !players) {
    throw new Error("Missing data")
  }

  // 🥇 jugador con mayor TSI
  const topPlayer = players.reduce((max: any, p: any) =>
    Number(p.TSI) > Number(max.TSI) ? p : max
  )

  // 🆕 jugador más nuevo
  const newestPlayer = players.reduce((latest: any, p: any) =>
    new Date(p.ArrivalDate) > new Date(latest.ArrivalDate) ? p : latest
  )

  return {
    team,
    topPlayer,
    newestPlayer,
  }
}