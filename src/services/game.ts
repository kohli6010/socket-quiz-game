import { Game, GameModel } from '../models/game';
import { QuestionModel } from '../models/question';
import { redis } from '../redisClient'; // Ensure redisClient uses the `redis` package
import { GameState } from '../models/game';
import { HttpException } from '../exceptions/httpException';
import { Service } from 'typedi';
import { Server, Socket } from 'socket.io';

@Service()
export class GameService {
  async startGame(playerId: string, socket: Socket, io: Server) {
    const waitingListKey = 'waitingListMap';

    // Get all keys in the Redis hash
    const availablePlayer = await redis.hKeys(waitingListKey); // Uses `redis` package's hKeys method

    if (availablePlayer.length > 0) {
      const matchedPlayerId = availablePlayer[0];
      const matchedSocketId = await redis.hGet(waitingListKey, matchedPlayerId);

      // Remove the matched player from the waiting list
      await redis.hDel(waitingListKey, matchedPlayerId);

      const game = await this.createGame(
        matchedPlayerId,
        playerId,
        matchedSocketId,
        socket.id
      );

      return game;
    } else {
      // Add the current player to the waiting list
      await redis.hSet(waitingListKey, playerId, socket.id); // Adds the player to Redis hash
      return { message: 'You are now in the waiting list' };
    }
  }

  async createGame(
    player1Id: string,
    player2Id: string,
    player1SocketId: string,
    player2SocketId: string
  ) {
    const questions = await QuestionModel.find();

    const game = new GameModel({
      player1Id,
      player2Id,
      player1SocketId,
      player2SocketId,
      questions: questions.map((q) => q._id.toString()),
      gameState: GameState.Active,
      player1Score: 0,
      player2Score: 0,
      currentQuestion: 0,
      hasPlayer1Answered: false,
      hasPlayer2Answered: false,
      lastAnsweredBy: -1,
    });

    try {
      await game.save();
    } catch (err) {
      console.error(err);
    }
    return game;
  }

  async handlePlayerDisconnect(playerId: string, io: Server) {
    const activeGames = await GameModel.find({
      $or: [{ player1Id: playerId }, { player2Id: playerId }],
      gameState: GameState.Active,
    });

    for (const game of activeGames) {
      game.gameState = GameState.Finished;
      const winner =
        game.player1Id === playerId ? game.player2SocketId : game.player1SocketId;
      await game.save();

      const winnerSocket = io.sockets.sockets.get(winner);
      if (winnerSocket) {
        winnerSocket.emit('game:end', { winner, reason: 'Player disconnected' });
      }
    }
  }

  async sendQuestion(game: Game, io: Server) {
    const question = await QuestionModel.findById(
      game.questions[game.currentQuestion]
    );

    if (!question) {
      throw new Error(`Question not found for index ${game.currentQuestion}`);
    }

    const player1Socket = io.sockets.sockets.get(game.player1SocketId);
    const player2Socket = io.sockets.sockets.get(game.player2SocketId);

    if (player1Socket) {
      player1Socket.emit('question:send', {
        question: question.questionText,
        options: question.options,
        questionIndex: game.currentQuestion,
      });
    }

    if (player2Socket) {
      player2Socket.emit('question:send', {
        question: question.questionText,
        options: question.options,
        questionIndex: game.currentQuestion,
      });
    }
  }

  async submitAnswer(gameId: string, playerId: string, answer: string, io: Server) {
    const game = await GameModel.findById(gameId);
    if (!game) throw new HttpException(400, 'Game not found');

    if (game.gameState !== GameState.Active) {
      throw new HttpException(400, 'Game is not active');
    }

    const question = await QuestionModel.findById(
      game.questions[game.currentQuestion]
    );

    if (!question) {
      throw new HttpException(400, 'Question not found');
    }

    const isCorrect = answer === question.correctAnswer;

    if (playerId === game.player1Id) {
      if (isCorrect) game.player1Score++;
      game.hasPlayer1Answered = true;
      game.lastAnsweredBy = 1;
    } else if (playerId === game.player2Id) {
      if (isCorrect) game.player2Score++;
      game.hasPlayer2Answered = true;
      game.lastAnsweredBy = 2;
    }

    if (game.hasPlayer1Answered && game.hasPlayer2Answered) {
      await this.progressToNextQuestion(game, io);
    }

    await game.save();
  }

  private async progressToNextQuestion(game: any, io: Server) {
    if (game.currentQuestion + 1 >= game.questions.length) {
      game.gameState = GameState.Finished;

      let winnerId: string | null = null;
      if (game.player1Score > game.player2Score) {
        winnerId = game.player1Id;
      } else if (game.player2Score > game.player1Score) {
        winnerId = game.player2Id;
      } else {
        winnerId = game.lastAnsweredBy === 1 ? game.player1Id : game.player2Id;
      }

      await game.save();

      const winnerSocket = io.sockets.sockets.get(
        winnerId === game.player1Id ? game.player1SocketId : game.player2SocketId
      );

      const loserSocket = io.sockets.sockets.get(
        winnerId === game.player1Id ? game.player2SocketId : game.player1SocketId
      );

      if (winnerSocket) {
        winnerSocket.emit('game:end', {
          winner: 'Winner',
          reason: 'Game finished',
        });
      }

      if (loserSocket) {
        loserSocket.emit('game:end', {
          winner: 'Loser',
          reason: 'Game finished',
        });
      }
      return;
    }

    game.currentQuestion++;
    game.hasPlayer1Answered = false;
    game.hasPlayer2Answered = false;

    await this.sendQuestion(game, io);
  }
}
