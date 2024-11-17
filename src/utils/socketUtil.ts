import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { GameService } from '../services/game';
import { HttpException } from '../exceptions/httpException';
import { Game } from '../models/game';

@Service()
export class SocketHandler {
    constructor(private gameService: GameService) { }

    public initialize(io: Server) {
        io.use((socket, next) => {
            const bearer = socket.handshake.headers.authorization;

            if (!bearer) return next(new HttpException(400, 'Authentication failed'));

            let token = bearer.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.playerId = (decoded as any).userId;
                next();
            } catch (err) {
                next(new HttpException(400, 'Invalid token'));
            }
        });

        io.on('connection', (socket: Socket) => this.handleConnection(socket, io));
    }

    private async handleConnection(socket: Socket, io: Server) {
        const playerId = socket.data.playerId;
        console.log(`Player connected: ${playerId}`);

        socket.on('game:start', async () => {
            try {
                const result = await this.gameService.startGame(playerId, socket, io);

                if ('message' in result) {
                    console.log(result.message);
                    socket.emit('waiting', result.message);
                } else {
                    this.emitGameInit(result, io);
                }
            } catch (error) {
                console.error('Error starting game:', error.message);
                socket.emit('error', { message: error.message });
            }
        });

        socket.on('answer:submit', async (data) => {
            try {
                const gameId = data.gameId;
                const answer = data.answer;

                await this.gameService.submitAnswer(gameId, playerId, answer, io);
            } catch (error) {
                console.error('Error submitting answer:', error.message);
                socket.emit('error', { message: error.message });
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Player ${playerId} disconnected`);
            await this.gameService.handlePlayerDisconnect(playerId, io);
        });
    }

    private async emitGameInit(game: Game, io: Server) {
        const player1Socket = io.sockets.sockets.get(game.player1SocketId);
        const player2Socket = io.sockets.sockets.get(game.player2SocketId);

        if (player1Socket) player1Socket.emit('game:init', game);
        if (player2Socket) player2Socket.emit('game:init', game);

        await this.gameService.sendQuestion(game, io);
    }
}
