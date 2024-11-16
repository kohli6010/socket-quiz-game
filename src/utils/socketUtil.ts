import { Server, Socket } from 'socket.io';
import { GameService } from '../services/game';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('game:start', async (playerId: string) => {
      const result = await GameService.startGame(playerId);
      
      if (result["message"]) {
        socket.emit('waiting', result["message"]);
      } else {
        socket.emit('game:init', result); 
        socket.broadcast.emit('game:init', result);
      }
    });

    socket.on('question:send', async ({ gameId, questionIndex }) => {
      const question = await GameService.sendQuestion(gameId, questionIndex);
      socket.emit('question:send', question);
      socket.broadcast.emit('question:send', question);
    });

    socket.on('answer:submit', async ({ gameId, playerId, answer }) => {
      const result = await GameService.submitAnswer(gameId, playerId, answer);
      socket.emit('answer:submit', result);
      socket.broadcast.emit('answer:submit', result);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
