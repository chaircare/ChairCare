import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'client'),
      where('status', '==', 'approved')
    );
    const querySnapshot = await getDocs(usersQuery);
    
    const clientUsers: any[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      clientUsers.push({
        id: doc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        companyName: userData.companyName,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      });
    });
    
    return res.status(200).json({ 
      success: true, 
      data: clientUsers
    });

  } catch (error) {
    console.error('Error getting clients:', error);
    return res.status(500).json({ success: false, error: 'Failed to load clients' });
  }
}