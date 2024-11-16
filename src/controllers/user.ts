import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { UserService } from '../services/user';
import RegisterOrLoginUserRequestDto from '../dtos/registerUser';

@Service()
export class UserController {
    constructor(private userService: UserService) {}

    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const body: RegisterOrLoginUserRequestDto = req.body;
        try {
            const token = await this.userService.registerUser(body.email, body.password);
            res.status(201).json({ message: 'User registered successfully', token });
        } catch (error) {
            next(error);
        }
    }

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const body: RegisterOrLoginUserRequestDto = req.body;
        try {
            const token = await this.userService.authenticateUser(body.email, body.password);
            res.status(200).json({ message: 'User logged in successfully', token });
        } catch (error) {
            next(error);
        }
    }
}
