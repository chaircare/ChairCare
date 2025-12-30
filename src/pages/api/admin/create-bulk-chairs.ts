import { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { CHAIR_CATEGORIES } from 'types/chair-care';

interface BulkChairRequest {
  userId: string;
  category: string;
  location: string;
  quantity: number;
  chairNumberPrefix: string;
  model?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, category, location, quantity, chairNumberPrefix, model }: BulkChairRequest = req.body;

    // Validate required fields
    if (!userId || !category || !location || !quantity || !chairNumberPrefix) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID, category, location, quantity, and chair number prefix are required' 
      });
    }

    // Validate quantity
    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be between 1 and 100' 
      });
    }

    // Validate category exists
    const validCategory = CHAIR_CATEGORIES.find(cat => cat.id === category);
    if (!validCategory) {
      return res.status(400).json({ success: false, error: 'Invalid chair category' });
    }

    // Create batch for bulk operations
    const batch = writeBatch(db);
    const createdChairs = [];

    for (let i = 1; i <= quantity; i++) {
      const chairId = `chair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const chairNumber = `${chairNumberPrefix}-${i.toString().padStart(3, '0')}`;
      const qrCode = `CHAIRCARE:${chairId}:${chairNumber}:${category}`;
      
      const chairData: any = {
        id: chairId,
        chairNumber,
        location,
        category: validCategory,
        userId,
        qrCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Only add model if it exists and is not empty
      if (model && model.trim()) {
        chairData.model = model.trim();
      }
      
      const chairRef = doc(db, 'chairs', chairId);
      batch.set(chairRef, chairData);
      
      createdChairs.push({
        id: chairId,
        chairNumber,
        qrCode,
        category: validCategory
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        chairs: createdChairs,
        quantity: quantity,
        category: validCategory,
        message: `${quantity} chairs created successfully`
      }
    });

  } catch (error) {
    console.error('Error creating bulk chairs:', error);
    return res.status(500).json({ success: false, error: 'Failed to create chairs' });
  }
}