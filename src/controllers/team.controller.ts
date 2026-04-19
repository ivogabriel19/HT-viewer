import { Request, Response } from "express"
import * as teamService from "../services/team.service"

export const getTeams = async (req: Request, res: Response) => {
  const data = await teamService.getTeams(req.htToken!)
  res.json(data)
}

export const getTeamSummary = async (req: Request, res: Response) => {
  const data = await teamService.getTeamSummary(req.htToken!)
  res.json(data)
}
