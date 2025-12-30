import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Logo } from 'components/ui/Logo';
import { PhotoUploadDebug } from 'components/PhotoUploadDebug';
import { uploadPhoto } from 'lib/firebase-storage';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const UploadCard = styled(Card)<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PreviewSection = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.xl} 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewCard = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-align: center;
`;

const PreviewTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text.primary};
`;

const UploadArea = styled.div<{ isDragOver: boolean; theme: any }>`
  border: 2px dashed ${props => props.isDragOver ? props.theme.colors.primary[500] : props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  background: ${props => props.isDragOver ? props.theme.colors.primary[50] : props.theme.colors.background.primary};
  transition: all 0.2s ease;
  margin: ${props => props.theme.spacing.lg} 0;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[500]};
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const UploadIcon = styled.div<{ theme: any }>`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const UploadText = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const UploadSubtext = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const CurrentLogo = styled.img`
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
`;

const LogoActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const StatusMessage = styled.div<{ type: 'success' | 'error'; theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin: ${props => props.theme.spacing.lg} 0;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${({ type, theme }) => type === 'error' ? `
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error[700]};
    border: 1px solid ${theme.colors.error[200]};
  ` : `
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[700]};
    border: 1px solid ${theme.colors.success[200]};
  `}
`;

const LogoUploadPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [customLogo, setCustomLogo] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Load existing logo from localStorage
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, [user, router]);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, GIF, WebP)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const logoPath = `branding/logo_${Date.now()}_${file.name}`;
      const downloadURL = await uploadPhoto(file, logoPath);
      
      setCustomLogo(downloadURL);
      localStorage.setItem('customLogo', downloadURL);
      
      setMessage({ 
        type: 'success', 
        text: 'Logo uploaded successfully! It will now appear throughout the application.' 
      });
      
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setCustomLogo('');
    localStorage.removeItem('customLogo');
    setMessage({ type: 'success', text: 'Logo removed. Default logo will be used.' });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/dashboard')}>
      <Container>
        <UploadCard theme={theme}>
          <Card.Header>
            <Card.Title>Custom Logo Upload</Card.Title>
          </Card.Header>
          <Card.Content>
            <p>Upload your custom logo to replace the default Chair Care logo throughout the application.</p>
            
            <UploadArea
              theme={theme}
              isDragOver={isDragOver}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <UploadIcon theme={theme}>🖼️</UploadIcon>
              <UploadText theme={theme}>
                {uploading ? 'Uploading logo...' : 'Upload Custom Logo'}
              </UploadText>
              <UploadSubtext theme={theme}>
                Drag and drop your logo here, or click to select<br />
                Supports PNG, JPG, GIF, WebP (max 5MB)<br />
                Recommended: 200x50px or similar aspect ratio
              </UploadSubtext>
            </UploadArea>

            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />

            {message && (
              <StatusMessage type={message.type} theme={theme}>
                {message.text}
              </StatusMessage>
            )}

            {customLogo && (
              <div style={{ textAlign: 'center', marginTop: theme.spacing.xl }}>
                <h3>Current Custom Logo:</h3>
                <CurrentLogo src={customLogo} alt="Custom Logo" theme={theme} />
                <LogoActions theme={theme}>
                  <Button variant="outline" onClick={openFileDialog}>
                    Replace Logo
                  </Button>
                  <Button variant="error" onClick={removeLogo}>
                    Remove Logo
                  </Button>
                </LogoActions>
              </div>
            )}
          </Card.Content>
        </UploadCard>

        <UploadCard theme={theme}>
          <Card.Header>
            <Card.Title>Logo Preview</Card.Title>
          </Card.Header>
          <Card.Content>
            <PreviewSection theme={theme}>
              <PreviewCard theme={theme}>
                <PreviewTitle theme={theme}>Light Theme</PreviewTitle>
                <Logo 
                  variant="light" 
                  size="lg" 
                  customLogo={customLogo}
                  customLogoAlt="Custom Logo"
                />
              </PreviewCard>
              <PreviewCard theme={theme}>
                <PreviewTitle theme={theme}>Dark Theme</PreviewTitle>
                <div style={{ background: '#1e293b', padding: theme.spacing.lg, borderRadius: theme.borderRadius.md }}>
                  <Logo 
                    variant="dark" 
                    size="lg" 
                    customLogo={customLogo}
                    customLogoAlt="Custom Logo"
                  />
                </div>
              </PreviewCard>
            </PreviewSection>
          </Card.Content>
        </UploadCard>

        {/* Debug Tool for Photo Upload Issues */}
        <PhotoUploadDebug />
      </Container>
    </Layout>
  );
};

export default LogoUploadPage;