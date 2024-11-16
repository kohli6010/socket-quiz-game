import { GameModel } from '../models/game';
import { QuestionModel } from '../models/question';
import { redis } from '../redisClient';
import { GameState } from '../models/game';
import { HttpException } from '../exceptions/httpException';

export class GameService {
  
  static async startGame(playerId: string) {
    const waitingListKey = 'waitingList'; 

    const matchedPlayerId = await redis.lpop(waitingListKey); 

    if (matchedPlayerId) {
      const game = await this.createGame(matchedPlayerId, playerId);
      return game;
    } else {
      await redis.rpush(waitingListKey, playerId);
      return { message: 'You are now in the waiting list' };
    }
  }

  static async createGame(player1Id: string, player2Id: string) {
    const questions = await QuestionModel.find(); 
    const game = new GameModel({
      player1Id,
      player2Id,
      questions: questions.map(q => q._id.toString()),
      gameState: GameState.Active,
      player1Score: 0,
      player2Score: 0,
      currentQuestion: 0
    });
    await game.save();
    return game;
  }

  static async sendQuestion(gameId: string, questionIndex: number) {
    const game = await GameModel.findById(gameId);
    if (!game) throw new HttpException(400, 'Game not found');
    
    if (game.gameState !== GameState.Active) {
      throw new HttpException(400, 'Game is not active');
    }

    const question = await QuestionModel.findById(game.questions[questionIndex]);
    return question;
  }

  static async submitAnswer(gameId: string, playerId: string, answer: string) {
    const game = await GameModel.findById(gameId);
    if (!game) throw new HttpException(400, 'Game not found');

    if (game.gameState !== GameState.Active) {
      throw new HttpException(400, 'Game is not active');
    }
    
    const question = await QuestionModel.findById(game.questions[game.currentQuestion]);
    const isCorrect = answer === question.correctAnswer;

    if (playerId === game.player1Id) {
      if (isCorrect) game.player1Score++;
    } else {
      if (isCorrect) game.player2Score++;
    }

    game.currentQuestion++;

    if (game.currentQuestion >= game.questions.length) {
      game.gameState = GameState.Finished; 
      await game.save();
      return { gameEnded: true, winner: game.player1Score > game.player2Score ? 'Player 1' : 'Player 2' };
    }

    await game.save();
    return { isCorrect, currentQuestion: game.currentQuestion };
  }

  static async handlePlayerLeave(gameId: string, playerId: string) {
    const game = await GameModel.findById(gameId);
    if (!game) throw new HttpException(400, 'Game not found');

    if (game.player1Id === playerId || game.player2Id === playerId) {
      game.gameState = GameState.Finished;
      await game.save();
      return { gameEnded: true, winner: game.player1Id === playerId ? 'Player 2' : 'Player 1' };
    }

    throw new HttpException(400, 'Player not found in the game');
  }
}
