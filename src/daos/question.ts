import { Service } from 'typedi';
import { Question, QuestionModel } from '../models/question';
import { BaseDao } from './baseDao';

@Service()
export class QuestionDao extends BaseDao<Question> {
    constructor() {
        super(QuestionModel)
    }
    async getAllQuestions() {
        return await QuestionModel.find();
    }

    async findQuestionById(questionId: string) {
        return await QuestionModel.findById(questionId);
    }
}
