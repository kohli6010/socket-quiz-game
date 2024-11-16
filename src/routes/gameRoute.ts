import { Router } from 'express';
import { Service } from 'typedi';
import { GameController } from '../controllers/game';
import validationMiddleware from '../middlewares/validationMiddleware';
import IRoutes from '../interfaces/routes';
import { authMiddleware } from '../middlewares/verifyToken';

@Service()
export default class GameRoutes implements IRoutes {
  public path: string = '/game';
  public router: Router;

  constructor(private gameController: GameController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/start`, authMiddleware, this.gameController.startGame);
    this.router.post(`${this.path}/leave`, this.gameController.handlePlayerLeave);
  }
}
