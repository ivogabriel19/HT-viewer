import { Request, Response } from "express"
import * as teamService from "../services/team.service"

export const getTeams = (_req: Request, res: Response) => {
  const teams = teamService.getTeams()
  res.json(teams)
}

export const getTeamSummary = (_req: Request, res: Response) => {
  const data = teamService.getTeamSummary()
  res.json(data)
}