import { Service } from 'typedi';
import { User, UserModel } from '../models/user';
import * as jwt from 'jsonwebtoken';
import { HttpException } from '../exceptions/httpException';
import { UserDao } from '../daos/user';

@Service()
export class UserService {
    
    constructor(private userDao: UserDao) {}

    public async registerUser(email: string, password: string): Promise<string> {
        try {
            const existingUser = await this.userDao.find({ email });
            if (existingUser.length) {
                throw new HttpException(400, 'User already exists');
            }
            
            
            let user = new UserModel({email, password})
            const newUser = await this.userDao.create(user);
    
            const token = this.generateJwtToken(newUser);
    
            return token;
        } catch (error) {
            throw error;
        }
    }
    

    private generateJwtToken(user: User): string {
        return jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
    }

    public async authenticateUser(email: string, password: string): Promise<string> {
        try {
            const users = await this.userDao.find({ email });
            if (!users.length) {
                throw new HttpException(400, 'Invalid credentials');
            }

            let user = users[0];

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new HttpException(400, 'Invalid credentials');
            }

            const token = this.generateJwtToken(user);

            return token;
        } catch (error) {
            throw error;
        }
    }
}
