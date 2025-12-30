import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from './firebase';
import { getUserProfile } from './firebase-auth';
import { User } from 'types/chair-care';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

export const requireFirebaseAuth = (requiredRole?: User['role']) => {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Get the authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ 
            success: false, 
            error: 'Authentication required. Please provide a valid token.' 
          });
        }

        const idToken = authHeader.split('Bearer ')[1];

        if (!idToken) {
          return res.status(401).json({ 
            success: false, 
            error: 'Authentication token is missing.' 
          });
        }

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (!decodedToken) {
          return res.status(401).json({ 
            success: false, 
            error: 'Invalid authentication token.' 
          });
        }

        // Get user profile from Firestore
        const userProfile = await getUserProfile(decodedToken.uid);
        
        if (!userProfile) {
          return res.status(401).json({ 
            success: false, 
            error: 'User profile not found.' 
          });
        }

        if (userProfile.status !== 'approved') {
          return res.status(403).json({ 
            success: false, 
            error: 'User account is not approved.' 
          });
        }

        // Check role permissions
        if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
          return res.status(403).json({ 
            success: false, 
            error: `Access denied. Required role: ${requiredRole}` 
          });
        }

        // Convert to User type and attach to request
        const user: User = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          companyName: userProfile.companyName,
          createdAt: userProfile.createdAt?.toDate ? userProfile.createdAt.toDate() : new Date(),
          updatedAt: userProfile.updatedAt?.toDate ? userProfile.updatedAt.toDate() : new Date()
        };

        (req as AuthenticatedRequest).user = user;
        
        return handler(req as AuthenticatedRequest, res);
      } catch (error) {
        console.error('Firebase auth middleware error:', error);
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed. Please log in again.' 
        });
      }
    };
  };
};