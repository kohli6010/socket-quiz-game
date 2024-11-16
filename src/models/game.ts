import { prop, getModelForClass } from '@typegoose/typegoose';
import { IsString, IsArray, IsNumber, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { Service } from 'typedi';

export enum GameState {
    Active = "active",
    Finished = "finished"
}

@Service()
export class Game {

    _id: Types.ObjectId;

    @prop({ required: false, unique: true })
    @IsString()
    player1Id: string;

    @prop({ required: false })
    @IsString()
    player2Id: string;

    @prop({ type: () => [Types.ObjectId], ref: 'Question' })
    questions: Types.ObjectId[];

    @prop({required: false})
    @IsNumber()
    player1Score: number;

    @prop({required: false})
    @IsNumber()
    player2Score: number;

    @prop({required: false})
    @IsNumber()
    currentQuestion: number;

    @prop({required: false})
    @IsEnum(GameState)
    gameState: GameState

}

export const GameModel = getModelForClass(Game);
