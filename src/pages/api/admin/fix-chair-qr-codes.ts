import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

// Helper function to generate QR code
const generateQRCode = (chairId: string, chairNumber: string) => `CHAIRCARE:${chairId}:${chairNumber}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get all chairs
    const chairsSnapshot = await getDocs(collection(db, 'chairs'));
    const fixedChairs = [];
    const alreadyHaveQR = [];
    const errors = [];

    for (const chairDoc of chairsSnapshot.docs) {
      const chairData = chairDoc.data();
      const chairId = chairDoc.id;

      try {
        // Check if chair already has a QR code
        if (chairData.qrCode && chairData.qrCode.trim() !== '') {
          alreadyHaveQR.push({
            id: chairId,
            chairNumber: chairData.chairNumber,
            qrCode: chairData.qrCode
          });
          continue;
        }

        // Generate QR code for chairs without one
        const qrCode = generateQRCode(chairId, chairData.chairNumber || chairId);
        
        // Update the chair with the QR code
        await updateDoc(doc(db, 'chairs', chairId), {
          qrCode,
          updatedAt: new Date()
        });

        fixedChairs.push({
          id: chairId,
          chairNumber: chairData.chairNumber,
          qrCode,
          location: chairData.location
        });

      } catch (error) {
        console.error(`Error fixing chair ${chairId}:`, error);
        errors.push({
          chairId,
          chairNumber: chairData.chairNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalChairs: chairsSnapshot.docs.length,
        fixedChairs: fixedChairs.length,
        alreadyHaveQR: alreadyHaveQR.length,
        errors: errors.length,
        details: {
          fixed: fixedChairs,
          alreadyHaveQR,
          errors
        }
      },
      message: `Fixed ${fixedChairs.length} chairs, ${alreadyHaveQR.length} already had QR codes, ${errors.length} errors`
    });

  } catch (error) {
    console.error('Error fixing chair QR codes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}