import { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { ServiceLog } from 'types/chair-care';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chairId, serviceType, description, userId, photos = [] } = req.body;

    if (!chairId || !serviceType || !description || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: chairId, serviceType, description, userId' 
      });
    }

    // Validate service type
    if (!['cleaning', 'repair'].includes(serviceType)) {
      return res.status(400).json({ 
        error: 'Invalid service type. Must be "cleaning" or "repair"' 
      });
    }

    // Get chair information to validate it exists
    const chairDoc = await getDoc(doc(db, 'chairs', chairId));
    if (!chairDoc.exists()) {
      return res.status(404).json({ error: 'Chair not found' });
    }

    // Calculate cost based on service type
    const baseCosts = {
      cleaning: 150,
      repair: 350
    };

    const cost = baseCosts[serviceType as keyof typeof baseCosts];

    // Process photos - separate by category
    const beforePhotos = photos.filter((photo: any) => photo.category === 'before');
    const generalPhotos = photos.filter((photo: any) => photo.category === 'general');

    // Create service request
    const serviceRequestData: Omit<ServiceLog, 'id'> = {
      chairId,
      clientId: userId,
      serviceType: serviceType as 'cleaning' | 'repair',
      description: description.trim(),
      cost,
      status: 'pending',
      beforePhotos: [...beforePhotos, ...generalPhotos], // Include general photos as before photos
      afterPhotos: [],
      technicianNotes: '',
      createdAt: new Date(),
      completedAt: undefined
    };

    const serviceRequestRef = await addDoc(collection(db, 'serviceLogs'), serviceRequestData);

    // Update chair status to indicate pending service
    await updateDoc(doc(db, 'chairs', chairId), {
      status: 'Pending Service',
      updatedAt: new Date()
    });

    // Send email notification to admin
    try {
      // const chairData = chairDoc.data();
      // await sendServiceRequestNotification('admin@chaircare.com', {
      //   chairId: chairData.chairId,
      //   location: chairData.location,
      //   serviceType,
      //   description,
      //   cost,
      //   photoCount: photos.length
      // });
      console.log('Service request notification would be sent to admin');
    } catch (emailError) {
      console.warn('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        id: serviceRequestRef.id,
        ...serviceRequestData
      },
      message: 'Service request submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting service request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}