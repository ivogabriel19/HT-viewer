import { Request, Response } from "express"
import * as playerService from "../services/player.service"
import { getPlayersWithAnalysis, buildLineup, calculateTeamChemistry } from "../services/player.service"

export const getPlayers = (_req: Request, res: Response) => {
  const players = playerService.getPlayers()
  res.json(players)
}

export const getPlayersAnalysis = (_req: Request, res: Response) => {
  const data = playerService.getPlayersWithAnalysis()
  res.json(data)
}

// export const getLineup = async (_req: Request, res: Response) => {
//   const formation = _req.query.formation  as string || "4-4-2";
//   const data = await playerService.getLineup(formation);

//   res.json(data);
// };

export const getLineup = (req: Request, res: Response) => {
  const formation = req.query.formation as string || "4-4-2"
  const data = buildLineup(formation)

  res.json(data)
}
