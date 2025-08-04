import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a custom interface to add our 'user' payload to the Express Request type
export interface AuthenticatedRequest extends Request {
  user?: { userId: number; username: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Attach the decoded payload to the request object
    req.user = decoded as { userId: number; username: string };
    next(); // Pass control to the next handler
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

