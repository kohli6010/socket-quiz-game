import { Service } from 'typedi';
import { UserModel,User } from '../models/user';
import { BaseDao } from './baseDao';

@Service()
export class UserDao extends BaseDao<User> {
    constructor() {
        super(UserModel);
    }
}
