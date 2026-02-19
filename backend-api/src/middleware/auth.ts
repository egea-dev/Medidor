import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request<any, any, any, any> {
    userId?: string;
    userRole?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
    }
    next();
};
