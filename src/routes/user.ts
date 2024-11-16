import { Router } from "express";
import IRoutes from "../interfaces/routes";
import { UserController } from "../controllers/user";
import validationMiddleware from "../middlewares/validationMiddleware";
import RegisterOrLoginUserRequestDto from "../dtos/registerUser";
import { Service } from "typedi";

@Service()
export default class UserRoutes implements IRoutes {
    public path: string = "/user";
    public router: Router;

    constructor(private userController: UserController) {
        this.router = Router();
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(RegisterOrLoginUserRequestDto, 'body'), this.userController.register);
        this.router.post(`${this.path}/login`, validationMiddleware(RegisterOrLoginUserRequestDto, 'body'), this.userController.login)
    }
    
}