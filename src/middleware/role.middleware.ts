import { Request, Response, NextFunction } from 'express';
import { APIError, HttpStatusCode } from '../common/errors/api.error';
import { ForbiddenError } from '../common/errors/http.error';


export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new APIError(HttpStatusCode.UNAUTHORIZED , "");
            }

            const userRole = req.user.role;
            if (!userRole) {
                throw new ForbiddenError();
            }

            if (!allowedRoles.includes(userRole)) {
                const lang = req.headers['accept-language'] || 'ar';
                const entity = lang === 'ar' ? 'المستخدم' : 'User';
                throw new ForbiddenError();
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};