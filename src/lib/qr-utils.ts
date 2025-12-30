import QRCode from 'qrcode';

export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 300,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M', // Medium error correction for better scanning
      type: 'image/png',
      quality: 0.92,
      rendererOpts: {
        quality: 0.92
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateQRCodeSVG = async (text: string): Promise<string> => {
  try {
    const qrCodeSVG = await QRCode.toString(text, {
      type: 'svg',
      width: 300,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
};

export const createChairQRData = (chairId: string, chairNumber: string): string => {
  // Create a simple, scannable format that phones can easily read
  // Format: CHAIRCARE:ID:NUMBER for easy parsing
  return `CHAIRCARE:${chairId}:${chairNumber}`;
};

export const parseChairQRData = (qrData: string): { id: string; number: string } | null => {
  try {
    // Handle the new format: CHAIRCARE:ID:NUMBER
    if (qrData.startsWith('CHAIRCARE:')) {
      const parts = qrData.split(':');
      if (parts.length >= 3) {
        return {
          id: parts[1],
          number: parts[2]
        };
      }
    }
    
    // Fallback for old JSON format
    const parsed = JSON.parse(qrData);
    if (parsed.type === 'chair' && parsed.id && parsed.number) {
      return {
        id: parsed.id,
        number: parsed.number
      };
    }
    
    // If it's just a simple string, treat it as chair code
    return {
      id: qrData,
      number: qrData
    };
  } catch (error) {
    // If it's not JSON, treat it as a simple chair code
    return {
      id: qrData,
      number: qrData
    };
  }
};