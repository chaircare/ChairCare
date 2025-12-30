import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import apiClient from 'lib/api-client';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Chair } from 'types/chair-care';
import { generateQRCodeDataURL } from 'lib/qr-utils';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { QRScannerIcon } from 'components/icons/IconSystem';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase';

const QRContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(3, 105, 161, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(3, 105, 161, 0.05) 100%)'
  };
  border: 1px solid ${props => props.theme.colors.primary[200]};
`;

const HeaderIcon = styled.div<{ theme: any }>`
  width: 4rem;
  height: 4rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(3, 105, 161, 0.3) 100%)'
    : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
  };
  border-radius: ${props => props.theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.lg};
  color: ${props => props.theme.mode === 'dark' ? '#60a5fa' : '#ffffff'};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const HeaderTitle = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ActionsSection = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ChairsGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing['3xl']};
`;

// const ClientSection = styled.div<{ theme: any }>`
//   margin-bottom: ${props => props.theme.spacing['3xl']};
// `;

const ClientHeader = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(3, 105, 161, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(3, 105, 161, 0.1) 100%)'
  };
  border: 2px solid ${props => props.theme.colors.primary[300]};
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.xl};
`;

const ClientInfo = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    text-align: center;
  }
`;

const ClientDetails = styled.div`
  flex: 1;
`;

const ClientName = styled.h2<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[700]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ClientMeta = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const ClientStats = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const StatItem = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.primary[200]};
  min-width: 80px;
`;

const StatNumber = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ClientActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ClientChairsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ChairCard = styled(Card)<{ theme: any }>`
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ChairHeader = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const ChairNumber = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ChairDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const QRSection = styled.div<{ theme: any }>`
  margin: ${props => props.theme.spacing.xl} 0;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 2px dashed ${props => props.theme.colors.border.primary};
`;

const QRImage = styled.img<{ theme: any }>`
  max-width: 200px;
  height: auto;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing.md};
`;

const QRCode = styled.div<{ theme: any }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.md};
  word-break: break-all;
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const LoadingContainer = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing['3xl']};
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.xl};
  }
  
  p {
    margin: 0 0 ${props => props.theme.spacing.xl} 0;
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`;

const QRGeneratorPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadChairs();
  }, [user, router]);

  const loadChairs = async () => {
    try {
      let chairsData: Chair[] = [];
      
      if (user?.role === 'admin') {
        // Admin can see all chairs
        const response = await apiClient.get('/api/admin/get-chairs');
        if (response.data.success) {
          chairsData = response.data.data;
        }
      } else {
        // Clients can only see their own chairs
        const chairsQuery = query(
          collection(db, 'chairs'),
          where('clientId', '==', user?.id || '')
        );
        
        const chairsSnapshot = await getDocs(chairsQuery);
        chairsData = chairsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Chair[];
      }
      
      setChairs(chairsData);
      
      // Generate QR codes for all chairs
      const qrCodePromises = chairsData.map(async (chair: Chair) => {
        try {
          const qrDataURL = await generateQRCodeDataURL(chair.qrCode);
          return { chairId: chair.id, qrDataURL };
        } catch (error) {
          console.error(`Failed to generate QR code for chair ${chair.id}:`, error);
          return { chairId: chair.id, qrDataURL: '' };
        }
      });
      
      const qrResults = await Promise.all(qrCodePromises);
      const qrCodesMap = qrResults.reduce((acc, { chairId, qrDataURL }) => {
        acc[chairId] = qrDataURL;
        return acc;
      }, {} as Record<string, string>);
      
      setQrCodes(qrCodesMap);
    } catch (error) {
      console.error('Failed to load chairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (chair: Chair) => {
    const qrDataURL = qrCodes[chair.id];
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `ChairCare-QR-${chair.chairNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = (chair: Chair) => {
    const qrDataURL = qrCodes[chair.id];
    if (!qrDataURL) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Chair Care QR Code - ${chair.chairNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              body { 
                font-family: 'Inter', Arial, sans-serif; 
                text-align: center; 
                padding: 40px 20px;
                background: white;
                margin: 0;
              }
              
              .qr-container {
                border: 3px solid #0ea5e9;
                border-radius: 16px;
                padding: 30px;
                display: inline-block;
                margin: 20px;
                background: white;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 300px;
              }
              
              .header {
                margin-bottom: 20px;
              }
              
              .logo {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
              }
              
              .brand {
                font-size: 24px;
                font-weight: bold;
                color: #0f172a;
                margin: 0;
              }
              
              .chair-info {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 12px;
              }
              
              .chair-number {
                font-size: 20px;
                font-weight: bold;
                color: #0ea5e9;
                margin: 0 0 8px 0;
              }
              
              .chair-details {
                font-size: 14px;
                color: #64748b;
                margin: 4px 0;
                line-height: 1.4;
              }
              
              .qr-code {
                margin: 20px 0;
              }
              
              .qr-code img {
                border-radius: 8px;
                background: white;
                padding: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              
              .qr-text {
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                color: #64748b;
                margin-top: 15px;
                word-break: break-all;
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }
              
              .instructions {
                margin-top: 20px;
                font-size: 12px;
                color: #64748b;
                line-height: 1.4;
              }
              
              @media print {
                body { padding: 20px; }
                .qr-container { 
                  page-break-inside: avoid;
                  box-shadow: none;
                  border: 2px solid #0ea5e9;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="header">
                <div class="logo">CC</div>
                <h1 class="brand">Chair Care</h1>
              </div>
              
              <div class="chair-info">
                <div class="chair-number">${chair.chairNumber}</div>
                <div class="chair-details">📍 ${chair.location}</div>
                ${chair.model ? `<div class="chair-details">🪑 ${chair.model}</div>` : ''}
              </div>
              
              <div class="qr-code">
                <img src="${qrDataURL}" alt="QR Code" width="180" height="180" />
              </div>
              
              <div class="qr-text">${chair.qrCode}</div>
              
              <div class="instructions">
                📱 Scan with your phone to request<br>
                cleaning or repair services
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodesHTML = chairs.map(chair => {
        const qrDataURL = qrCodes[chair.id];
        if (!qrDataURL) return '';
        
        return `
          <div class="qr-container">
            <div class="header">
              <div class="logo">CC</div>
              <h2 class="brand">Chair Care</h2>
            </div>
            
            <div class="chair-info">
              <div class="chair-number">${chair.chairNumber}</div>
              <div class="chair-details">📍 ${chair.location}</div>
              ${chair.model ? `<div class="chair-details">🪑 ${chair.model}</div>` : ''}
            </div>
            
            <div class="qr-code">
              <img src="${qrDataURL}" alt="QR Code" width="140" height="140" />
            </div>
            
            <div class="qr-text">${chair.qrCode}</div>
            
            <div class="instructions">
              📱 Scan to request services
            </div>
          </div>
        `;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Chair Care - All QR Codes</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              body { 
                font-family: 'Inter', Arial, sans-serif; 
                padding: 20px;
                background: white;
                margin: 0;
              }
              
              .qr-container {
                border: 2px solid #0ea5e9;
                border-radius: 12px;
                padding: 20px;
                display: inline-block;
                margin: 10px;
                text-align: center;
                vertical-align: top;
                width: 220px;
                background: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              
              .header { margin-bottom: 15px; }
              
              .logo {
                width: 30px;
                height: 30px;
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
                border-radius: 8px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 8px;
              }
              
              .brand {
                font-size: 18px;
                font-weight: bold;
                color: #0f172a;
                margin: 0;
              }
              
              .chair-info {
                margin-bottom: 15px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
              }
              
              .chair-number {
                font-size: 16px;
                font-weight: bold;
                color: #0ea5e9;
                margin: 0 0 6px 0;
              }
              
              .chair-details {
                font-size: 11px;
                color: #64748b;
                margin: 3px 0;
                line-height: 1.3;
              }
              
              .qr-code { margin: 15px 0; }
              
              .qr-code img {
                border-radius: 6px;
                background: white;
                padding: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .qr-text {
                font-family: 'JetBrains Mono', monospace;
                font-size: 9px;
                color: #64748b;
                margin-top: 10px;
                word-break: break-all;
                background: white;
                padding: 6px 8px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
              
              .instructions {
                margin-top: 12px;
                font-size: 10px;
                color: #64748b;
                line-height: 1.3;
              }
              
              @media print {
                .qr-container {
                  page-break-inside: avoid;
                  box-shadow: none;
                  border: 1px solid #0ea5e9;
                }
              }
            </style>
          </head>
          <body>
            ${qrCodesHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/dashboard')}>
        <LoadingContainer theme={theme}>Generating QR codes...</LoadingContainer>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/dashboard')}>
      <QRContainer>
        <HeaderSection theme={theme}>
          <Card.Content>
            <HeaderIcon theme={theme}>
              <QRScannerIcon size={32} />
            </HeaderIcon>
            <HeaderTitle theme={theme}>QR Code Generator</HeaderTitle>
            <HeaderSubtitle theme={theme}>
              Generate professional QR code labels for your chairs that can be easily scanned by any smartphone
            </HeaderSubtitle>
            
            {chairs.length > 0 && (
              <ActionsSection theme={theme}>
                <Button 
                  onClick={printAllQRCodes}
                  size="lg"
                  variant="primary"
                >
                  🖨️ Print All QR Codes
                </Button>
                <Button 
                  onClick={() => router.push('/chairs/create')}
                  size="lg"
                  variant="secondary"
                >
                  ➕ Add New Chair
                </Button>
              </ActionsSection>
            )}
          </Card.Content>
        </HeaderSection>
        
        {chairs.length === 0 ? (
          <EmptyState theme={theme}>
            <h3>No Chairs Found</h3>
            <p>Add some chairs to the system first to generate QR codes.</p>
            <Button 
              onClick={() => router.push('/chairs/create')}
              size="lg"
            >
              Add Your First Chair
            </Button>
          </EmptyState>
        ) : (
          <ChairsGrid theme={theme}>
            {chairs.map((chair) => (
              <ChairCard key={chair.id} theme={theme}>
                <ChairHeader theme={theme}>
                  <ChairNumber theme={theme}>{chair.chairNumber}</ChairNumber>
                  <ChairDetails theme={theme}>
                    📍 {chair.location}<br />
                    {chair.model && `🪑 ${chair.model}`}
                  </ChairDetails>
                </ChairHeader>
                
                <QRSection theme={theme}>
                  {qrCodes[chair.id] ? (
                    <>
                      <QRImage 
                        theme={theme}
                        src={qrCodes[chair.id]} 
                        alt={`QR Code for ${chair.chairNumber}`} 
                      />
                      <QRCode theme={theme}>{chair.qrCode}</QRCode>
                    </>
                  ) : (
                    <div style={{ color: theme.colors.text.secondary }}>
                      Generating QR code...
                    </div>
                  )}
                </QRSection>
                
                <ActionButtons theme={theme}>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadQRCode(chair)}
                    disabled={!qrCodes[chair.id]}
                  >
                    📥 Download
                  </Button>
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => printQRCode(chair)}
                    disabled={!qrCodes[chair.id]}
                  >
                    🖨️ Print Label
                  </Button>
                </ActionButtons>
              </ChairCard>
            ))}
          </ChairsGrid>
        )}
      </QRContainer>
    </Layout>
  );
};

export default QRGeneratorPage;