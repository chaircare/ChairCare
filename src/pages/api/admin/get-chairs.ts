import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const chairsCollection = collection(db, 'chairs');
    const querySnapshot = await getDocs(chairsCollection);
    
    const chairs: any[] = [];
    
    for (const chairDoc of querySnapshot.docs) {
      const chairData = chairDoc.data();
      
      // Get user data if needed
      let user = undefined;
      if (chairData.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', chairData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            user = {
              id: userDoc.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              companyName: userData.companyName
            };
          }
        } catch (userError) {
          console.error('Error fetching user for chair:', chairData.userId, userError);
        }
      }
      
      chairs.push({
        id: chairDoc.id,
        chairNumber: chairData.chairNumber,
        location: chairData.location,
        model: chairData.model,
        qrCode: chairData.qrCode,
        userId: chairData.userId,
        user,
        createdAt: chairData.createdAt,
        updatedAt: chairData.updatedAt
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: chairs
    });

  } catch (error) {
    console.error('Error getting chairs:', error);
    return res.status(500).json({ success: false, error: 'Failed to load chairs' });
  }
}