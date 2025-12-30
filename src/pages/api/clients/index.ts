import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getClients, createClient } from 'lib/database';
import { ApiResponse, Client, CreateClientForm } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Client[] | Client>>
) {
  try {
    if (req.method === 'GET') {
      const clients = await getClients();
      
      res.status(200).json({
        success: true,
        data: clients
      });
    } else if (req.method === 'POST') {
      const clientData: CreateClientForm = req.body;
      
      if (!clientData.contactPerson || !clientData.email || !clientData.phone) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: contactPerson, email, phone'
        });
      }
      
      const client = await createClient(clientData);
      
      res.status(201).json({
        success: true,
        data: client
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Clients API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth('admin')(handler);