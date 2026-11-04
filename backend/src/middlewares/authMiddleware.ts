import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "../types/express.js";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized. No token provided.'
    });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as UserJwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
     message: 'Forbidden - Invalid or expired token',
    });
  }
};
