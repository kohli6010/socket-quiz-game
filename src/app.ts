import express from 'express';
import './models/db-config'
import errorMiddleware from './middlewares/errorMiddleware';
import {Container} from 'typedi';
import UserRoutes from './routes/user';
import {connectDB} from './models/db-config';
import {createServer} from 'http';
import {Server} from "socket.io";
import { SocketHandler } from './utils/socketUtil';

connectDB().catch(console.log)

const app = express()

app.use(express.json())

const server = createServer(app);
const io = new Server(server)
const socketHandler = Container.get(SocketHandler);
socketHandler.initialize(io)



app.use("/", Container.get(UserRoutes).router);

app.use(errorMiddleware);

export default server;