import express from 'express';
import './models/db-config'
import errorMiddleware from './middlewares/errorMiddleware';
import {Container} from 'typedi';
import UserRoutes from './routes/user';
import {connectDB} from './models/db-config';
import http from 'http';
import socketIo from 'socket.io';
import { setupSocketIO } from './utils/socketUtil';

connectDB().catch(console.log)

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);

setupSocketIO(io);

app.use(express.json())

app.use("/", Container.get(UserRoutes).router);

app.use(errorMiddleware);

export default app;