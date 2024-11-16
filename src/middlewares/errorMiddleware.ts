import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';

const errorMiddleware = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpException) {
        try {
            const status: number = err.status || 500;
            const error: string = err.message || 'Something went wrong';
            const data: string = err.data || null;

            console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${error}`);
            res.status(status).json({ error, data });
        } catch (error) {
            next(error);
        }
    } else {
        next(err);
    }
};

export default errorMiddleware;