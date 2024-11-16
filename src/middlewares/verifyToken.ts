import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/httpException";
import jwt from 'jsonwebtoken';
import { User } from "../models/user";

let jwtSecret = process.env.JWT_SECRET


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
  
    if (!token) {
        next(new HttpException(401, "No token provided."))
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret) as User;

      (req as any).user = decoded;
      console.log(decoded)
  
      next();
    } catch (error) {
      next(new HttpException(400, "Invalid token"));
    }
  };