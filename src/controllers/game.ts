import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { GameService } from '../services/game';
import { HttpException } from '../exceptions/httpException';

@Service()
export class GameController {
  constructor() {}

  public startGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const playerId: string = (req as any).user._id;
    try {
      const result = await GameService.startGame(playerId);
      if (result["message"]) {
        res.status(200).json({ message: result["message"] });
      } else {
        res.status(200).json({ game: result });
      }
    } catch (error) {
      next(error);
    }
  };

  public handlePlayerLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { gameId, playerId } = req.body; 
    try {
      const result = await GameService.handlePlayerLeave(gameId, playerId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
