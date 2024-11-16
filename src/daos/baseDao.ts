import { DocumentType, ReturnModelType } from '@typegoose/typegoose';

export class BaseDao<T> {
    private model: ReturnModelType<any>;

    constructor(model: ReturnModelType<any>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<DocumentType<T>> {
        return await this.model.create(data);
    }

    async find(query: Partial<T>): Promise<DocumentType<T>[]> {
        return await this.model.find(query);
    }
}
