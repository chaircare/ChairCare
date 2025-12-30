// Firebase Authentication utilities
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from 'types/chair-care';

// Extended user profile stored in Firestore
export interface UserProfile extends Omit<User, 'createdAt' | 'updatedAt'> {
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  approvedBy?: string; // Admin user ID who approved
  approvedAt?: any; // Firestore timestamp
  tempPassword?: string; // Temporary password for admin-created accounts
  passwordResetRequired?: boolean; // Flag to indicate password reset is required
  firebasePasswordOutdated?: boolean; // Flag to indicate Firebase Auth password needs updating
}

// Client registration request
export interface ClientRequest {
  id?: string;
  companyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  processedAt?: any;
  processedBy?: string; // Admin user ID
  rejectionReason?: string;
}

// Create user profile in Firestore
export const createUserProfile = async (
  firebaseUser: FirebaseUser, 
  additionalData: Partial<UserProfile> = {}
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { email, displayName } = firebaseUser;
    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      email: email || '',
      name: displayName || additionalData.name || '',
      role: additionalData.role || 'client',
      companyName: additionalData.companyName,
      status: additionalData.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData
    };

    await setDoc(userRef, userProfile);
    return userProfile;
  }

  return userDoc.data() as UserProfile;
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Firebase Auth sign in
export const signInUser = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    // First try regular Firebase authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Try to get user profile by Firebase UID first
      let userProfile = await getUserProfile(userCredential.user.uid);
      
      // If no profile found by UID, try to find by email and link them
      if (!userProfile) {
        console.log(`No profile found for UID ${userCredential.user.uid}, searching by email...`);
        
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', email)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          console.log(`Found user by email, linking to Firebase UID...`);
          
          // Create new document with Firebase UID as the document ID
          const newUserProfile = {
            ...userData,
            id: userCredential.user.uid,
            updatedAt: serverTimestamp()
          };
          
          await setDoc(doc(db, 'users', userCredential.user.uid), newUserProfile);
          
          // Delete old document if it has a different ID
          if (userDoc.id !== userCredential.user.uid) {
            await deleteDoc(doc(db, 'users', userDoc.id));
          }
          
          userProfile = newUserProfile as UserProfile;
          console.log(`✅ Successfully linked user ${email} to Firebase UID ${userCredential.user.uid}`);
        }
      }
      
      // Check if user is approved
      if (userProfile && userProfile.status !== 'approved') {
        await signOut(auth);
        throw new Error('Account pending approval or suspended');
      }
      
      // Clear any password reset flags since they successfully logged in
      if (userProfile && (userProfile.firebasePasswordOutdated || userProfile.passwordResetRequired)) {
        try {
          await updateDoc(doc(db, 'users', userProfile.id), {
            firebasePasswordOutdated: false,
            passwordResetRequired: false,
            tempPassword: null,
            passwordResetSent: false,
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Cleared password reset flags for user:', userProfile.email);
        } catch (updateError) {
          console.error('Failed to clear password reset flags:', updateError);
          // Don't fail the login, just log the error
        }
      }
      
      return userProfile;
    } catch (firebaseError: any) {
      console.error('Firebase authentication error:', firebaseError.code, firebaseError.message);
      
      // If Firebase auth fails, check if it's a client with temp password
      if (firebaseError.code === 'auth/invalid-credential' || 
          firebaseError.code === 'auth/user-not-found' ||
          firebaseError.code === 'auth/wrong-password') {
        
        // Try to find user by email in Firestore with temp password
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', email)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          // Check if temp password matches and user is approved
          if (userData.tempPassword === password && userData.status === 'approved') {
            console.log('User found with temp password, creating Firebase auth account...');
            
            // Create Firebase auth account for this user
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              
              // Update the user document with Firebase UID and remove temp password
              const updatedProfile = {
                ...userData,
                id: userCredential.user.uid,
                tempPassword: null,
                passwordResetRequired: false,
                firebasePasswordOutdated: false,
                updatedAt: serverTimestamp()
              };
              
              await setDoc(doc(db, 'users', userCredential.user.uid), updatedProfile);
              
              // Delete old document if it has a different ID
              if (userDoc.id !== userCredential.user.uid) {
                await deleteDoc(doc(db, 'users', userDoc.id));
              }
              
              console.log('✅ Successfully created Firebase auth account and linked user');
              
              return updatedProfile as UserProfile;
            } catch (createError: any) {
              console.error('Error creating Firebase auth account:', createError);
              
              // If account already exists, try to sign in again
              if (createError.code === 'auth/email-already-in-use') {
                console.log('Firebase account already exists, attempting sign in...');
                try {
                  const userCredential = await signInWithEmailAndPassword(auth, email, password);
                  
                  // Link the existing Firebase account to our user profile
                  const updatedProfile = {
                    ...userData,
                    id: userCredential.user.uid,
                    tempPassword: null,
                    passwordResetRequired: false,
                    firebasePasswordOutdated: false,
                    updatedAt: serverTimestamp()
                  };
                  
                  await setDoc(doc(db, 'users', userCredential.user.uid), updatedProfile);
                  
                  // Delete old document if it has a different ID
                  if (userDoc.id !== userCredential.user.uid) {
                    await deleteDoc(doc(db, 'users', userDoc.id));
                  }
                  
                  return updatedProfile as UserProfile;
                } catch (signInError) {
                  console.error('Failed to sign in with existing Firebase account:', signInError);
                  throw new Error('Account exists but password may have been changed. Please use password reset.');
                }
              }
              
              throw new Error('Failed to activate account');
            }
          }
        }
      }
      
      // Re-throw the original error if no temp password match
      throw firebaseError;
    }
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Firebase Auth sign out
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Submit client registration request
export const submitClientRequest = async (requestData: Omit<ClientRequest, 'id' | 'status' | 'createdAt'>): Promise<void> => {
  try {
    // Check if email already exists in requests or users
    const requestsQuery = query(
      collection(db, 'clientRequests'),
      where('email', '==', requestData.email)
    );
    const existingRequests = await getDocs(requestsQuery);
    
    if (!existingRequests.empty) {
      throw new Error('A request with this email already exists');
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', requestData.email)
    );
    const existingUsers = await getDocs(usersQuery);
    
    if (!existingUsers.empty) {
      throw new Error('A user with this email already exists');
    }

    // Create the request
    const requestRef = doc(collection(db, 'clientRequests'));
    const clientRequest: ClientRequest = {
      id: requestRef.id,
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    await setDoc(requestRef, clientRequest);
  } catch (error) {
    console.error('Error submitting client request:', error);
    throw error;
  }
};

// Get all pending client requests (admin only)
export const getPendingClientRequests = async (): Promise<ClientRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, 'clientRequests'),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(requestsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientRequest));
  } catch (error) {
    console.error('Error getting client requests:', error);
    return [];
  }
};

// Approve client request and create user account (admin only)
export const approveClientRequest = async (
  requestId: string, 
  adminUid: string,
  temporaryPassword: string
): Promise<{ email: string; password: string }> => {
  try {
    // Get the request
    const requestRef = doc(db, 'clientRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const request = requestDoc.data() as ClientRequest;
    
    // Create Firebase user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      request.email, 
      temporaryPassword
    );
    
    // Create user profile
    const userProfile: UserProfile = {
      id: userCredential.user.uid,
      email: request.email,
      name: request.contactPerson,
      role: 'client',
      companyName: request.companyName,
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approvedBy: adminUid,
      approvedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'approved',
      processedAt: serverTimestamp(),
      processedBy: adminUid
    });
    
    // Sign out the admin (since we just created a user account)
    await signOut(auth);
    
    return {
      email: request.email,
      password: temporaryPassword
    };
  } catch (error) {
    console.error('Error approving client request:', error);
    throw error;
  }
};

// Reject client request (admin only)
export const rejectClientRequest = async (
  requestId: string, 
  adminUid: string, 
  reason: string
): Promise<void> => {
  try {
    const requestRef = doc(db, 'clientRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      processedAt: serverTimestamp(),
      processedBy: adminUid,
      rejectionReason: reason
    });
  } catch (error) {
    console.error('Error rejecting client request:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};