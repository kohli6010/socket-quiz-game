import { Service } from 'typedi';
import { Game, GameModel } from '../models/game';
import { BaseDao } from './baseDao';
import { GameState } from '../models/game';

@Service()
export class GameDao extends BaseDao<Game> {
  constructor() {
    super(GameModel);
  }

  async createGame(gameData: any) {
    const game = new GameModel(gameData);
    return await game.save();
  }

  async findGameById(gameId: string) {
    return await GameModel.findById(gameId);
  }

  async updateGame(game: any) {
    return await game.save();
  }

  async findActiveGameByPlayerId(playerId: string) {
    return await GameModel.findOne({
      $and: [
        { gameState: GameState.Active },
        { $or: [{ player1Id: playerId }, { player2Id: playerId }] },
      ],
    });
  }
}
