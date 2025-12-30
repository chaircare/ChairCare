// Firebase initialization and setup
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { initializeServicePricing } from './firebase-database';
import { UserProfile } from './firebase-auth';

// Initialize Firebase with default admin user and data
export const initializeFirebase = async (): Promise<void> => {
  try {
    console.log('Initializing Firebase...');
    
    // Check if admin user already exists
    const adminRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      console.log('Creating default admin user...');
      
      // Create admin user
      const adminProfile: UserProfile = {
        id: 'admin',
        email: 'admin@chaircare.co.za',
        name: 'Chair Care Admin',
        role: 'admin',
        status: 'approved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(adminRef, adminProfile);
      console.log('Admin user created successfully');
    }
    
    // Initialize service pricing
    await initializeServicePricing();
    console.log('Service pricing initialized');
    
    console.log('Firebase initialization complete');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

// Create default admin account (for development)
export const createDefaultAdmin = async (): Promise<void> => {
  try {
    // This should only be run once during setup
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@chaircare.co.za', 
      'admin123'
    );
    
    const adminProfile: UserProfile = {
      id: userCredential.user.uid,
      email: 'admin@chaircare.co.za',
      name: 'Chair Care Admin',
      role: 'admin',
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), adminProfile);
    console.log('Default admin created with email: admin@chaircare.co.za, password: admin123');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};