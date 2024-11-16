import { prop, getModelForClass } from '@typegoose/typegoose';
import { IsString, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { Service } from 'typedi';

@Service()
export class Question {

    _id: Types.ObjectId;

    @prop({ required: true, unique: true })
    @IsString()
    questionText!: string;

    @prop({ required: true, type: () => [String] })
    @IsArray()
    options!: string[];

    @prop({ required: true })
    @IsString()
    correctAnswer: string;

}

export const QuestionModel = getModelForClass(Question);
