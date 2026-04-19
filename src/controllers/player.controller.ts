import { Request, Response } from "express"
import * as playerService from "../services/player.service"

export const getPlayers = async (req: Request, res: Response) => {
  const data = await playerService.getPlayers(req.htToken!)
  res.json(data)
}

export const getPlayersAnalysis = async (req: Request, res: Response) => {
  const data = await playerService.getPlayersWithAnalysis(req.htToken!)
  res.json(data)
}

export const getLineup = async (req: Request, res: Response) => {
  const formation = (req.query.formation as string) || "4-4-2"
  const data = await playerService.buildLineup(formation, req.htToken!)
  res.json(data)
}
