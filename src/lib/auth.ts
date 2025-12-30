// Authentication utilities
import { User } from 'types/chair-care';
import { getUserByEmail } from './database';

// Simple session management for MVP
// In production, use proper JWT tokens or session management

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// Mock sessions storage (in production, use Redis or database)
const sessions = new Map<string, AuthSession>();

export const generateToken = (): string => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export const createSession = (user: User): AuthSession => {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
  
  const session: AuthSession = {
    user,
    token,
    expiresAt
  };
  
  sessions.set(token, session);
  return session;
};

export const getSession = (token: string): AuthSession | null => {
  const session = sessions.get(token);
  if (!session) return null;
  
  if (new Date() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session;
};

export const deleteSession = (token: string): void => {
  sessions.delete(token);
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simple authentication for MVP - in production, hash passwords properly
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  // For MVP, accept any password for demo purposes
  // In production: compare hashed passwords
  return user;
};

export const requireAuth = (requiredRole?: User['role']) => {
  return (handler: any) => {
    return async (req: any, res: any) => {
      try {
        const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        const session = getSession(token);
        
        if (!session) {
          return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }
        
        if (requiredRole && session.user.role !== requiredRole && session.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        
        req.user = session.user;
        return handler(req, res);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ success: false, error: 'Authentication error' });
      }
    };
  };
};