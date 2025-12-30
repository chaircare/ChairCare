import { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { CreateChairForm, CHAIR_CATEGORIES } from 'types/chair-care';

interface CreateChairRequest extends CreateChairForm {
  userId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { chairNumber, location, category, model, userId }: CreateChairRequest = req.body;

    // Validate required fields
    if (!chairNumber || !location || !category || !userId) {
      return res.status(400).json({ success: false, error: 'Chair number, location, category, and user ID are required' });
    }

    // Validate category exists
    const validCategory = CHAIR_CATEGORIES.find(cat => cat.id === category);
    if (!validCategory) {
      return res.status(400).json({ success: false, error: 'Invalid chair category' });
    }

    // Generate a unique ID for the chair
    const chairId = `chair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const qrCode = `CHAIRCARE:${chairId}:${chairNumber}:${category}`;
    
    // Create chair document
    const chairData: any = {
      id: chairId,
      chairNumber,
      location,
      category: validCategory,
      clientId: userId, // Use clientId instead of userId for consistency
      qrCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Only add model if it exists and is not empty
    if (model && model.trim()) {
      chairData.model = model.trim();
    }
    
    await setDoc(doc(db, 'chairs', chairId), chairData);
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        id: chairId,
        qrCode,
        category: validCategory,
        message: 'Chair created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating chair:', error);
    return res.status(500).json({ success: false, error: 'Failed to create chair' });
  }
}