import { Request, Response } from "express";
import jwt from "jsonwebtoken"

const jwt_secret_key = process.env.JWT_SECRET_KEY;

async function verifyToken(req: Request, res: Response, next: Function): Promise<any>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({message: "No token provided"})
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, jwt_secret_key as string);
        (req as any).user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });

    }
}

export default verifyToken;