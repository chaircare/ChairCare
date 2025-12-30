import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from 'lib/firebase';

interface ResetPasswordRequest {
  userId: string;
  newPassword?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, newPassword }: ResetPasswordRequest = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Always use Firebase's built-in password reset for proper Firebase Auth password reset
    try {
      console.log(`Sending Firebase password reset email to: ${userData.email}`);
      
      // Send Firebase password reset email - this will reset the actual Firebase Auth password
      await sendPasswordResetEmail(auth, userData.email);
      
      console.log(`✅ Firebase password reset email sent to: ${userData.email}`);
      
      // Update user document to track the reset and clear any temp passwords
      await updateDoc(userRef, {
        passwordResetSent: true,
        passwordResetAt: serverTimestamp(),
        tempPassword: null, // Clear any temp password
        passwordResetRequired: false, // Clear this flag
        firebasePasswordOutdated: false, // Clear this flag
        updatedAt: serverTimestamp()
      });
      
      return res.status(200).json({ 
        success: true, 
        data: { 
          email: userData.email,
          message: 'Password reset email sent! Check your email for the reset link from Firebase. This will reset your actual login password.'
        }
      });
      
    } catch (firebaseError: any) {
      console.error('Firebase password reset error:', firebaseError);
      
      // If Firebase reset fails, return the error - don't fall back to temp passwords
      // This ensures we're always resetting the actual Firebase Auth password
      return res.status(400).json({ 
        success: false, 
        error: `Failed to send password reset email: ${firebaseError.message}. Please check that the email address is valid and associated with a Firebase account.`
      });
    }

  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
}