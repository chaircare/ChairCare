import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Clear users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const deletePromises = usersSnapshot.docs.map(userDoc => 
      deleteDoc(doc(db, 'users', userDoc.id))
    );
    
    await Promise.all(deletePromises);

    // Clear chairs collection
    const chairsRef = collection(db, 'chairs');
    const chairsSnapshot = await getDocs(chairsRef);
    
    const deleteChairPromises = chairsSnapshot.docs.map(chairDoc => 
      deleteDoc(doc(db, 'chairs', chairDoc.id))
    );
    
    await Promise.all(deleteChairPromises);

    return res.status(200).json({ 
      success: true, 
      message: `Cleared ${usersSnapshot.docs.length} users and ${chairsSnapshot.docs.length} chairs from Firebase` 
    });

  } catch (error) {
    console.error('Error resetting Firebase:', error);
    return res.status(500).json({ success: false, error: 'Failed to reset Firebase' });
  }
}