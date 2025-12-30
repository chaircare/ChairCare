import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { theme } from 'styles/theme';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';

interface JobPhotoCaptureProps {
  onPhotoCapture: (photos: CapturedPhoto[]) => void;
  jobId: string;
  chairId: string;
  existingPhotos?: CapturedPhoto[];
  required?: boolean;
}

export interface CapturedPhoto {
  id: string;
  file: File;
  preview: string;
  category: 'before' | 'during' | 'after';
  timestamp: Date;
  chairId: string;
  jobId: string;
}

const PhotoCaptureContainer = styled(Card)<{ theme: any; mode: string }>`
  background: ${props => props.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
`;

const PhotoHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius.xl} ${props => props.theme.borderRadius.xl} 0 0;
`;

const PhotoTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const PhotoSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  opacity: 0.9;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const PhotoContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const CategorySection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CategoryTitle = styled.h4<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CategoryIcon = styled.span<{ category: string }>`
  font-size: ${theme.typography.fontSize.lg};
  
  ${({ category }) => {
    switch (category) {
      case 'before': return '📸';
      case 'during': return '🔧';
      case 'after': return '✅';
      default: return '📷';
    }
  }}
`;

const PhotoGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PhotoSlot = styled.div<{ theme: any; hasPhoto: boolean; mode: string }>`
  aspect-ratio: 4/3;
  border: 2px dashed ${props => props.hasPhoto 
    ? props.theme.colors.success[300]
    : props.theme.colors.border.primary
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  background: ${props => props.hasPhoto 
    ? 'transparent'
    : props.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.5)' 
      : props.theme.colors.gray[50]
  };
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[400]};
    transform: translateY(-2px);
  }
`;

const PhotoImage = styled.img<{ theme: any }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoPlaceholder = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  padding: ${props => props.theme.spacing.md};
`;

const PhotoIcon = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  margin-bottom: ${props => props.theme.spacing.sm};
  opacity: 0.5;
`;

const PhotoText = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const PhotoActions = styled.div<{ theme: any }>`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button<{ theme: any; variant?: 'remove' | 'retake' }>`
  background: ${props => props.variant === 'remove' 
    ? props.theme.colors.error[500]
    : props.theme.colors.primary[500]
  };
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.xs};
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const CaptureButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const HiddenInput = styled.input`
  display: none;
`;

const PhotoTimestamp = styled.div<{ theme: any }>`
  position: absolute;
  bottom: ${props => props.theme.spacing.xs};
  left: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-align: center;
`;

const RequiredBadge = styled.span<{ theme: any }>`
  background: ${props => props.theme.colors.error[100]};
  color: ${props => props.theme.colors.error[700]};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const JobPhotoCapture: React.FC<JobPhotoCaptureProps> = ({
  onPhotoCapture,
  jobId,
  chairId,
  existingPhotos = [],
  required = false
}) => {
  const { theme, mode } = useTheme();
  const [photos, setPhotos] = useState<CapturedPhoto[]>(existingPhotos);
  const [activeCategory, setActiveCategory] = useState<'before' | 'during' | 'after' | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { key: 'before' as const, label: 'Before Service', description: 'Take photos before starting work' },
    { key: 'during' as const, label: 'During Service', description: 'Document the service process' },
    { key: 'after' as const, label: 'After Service', description: 'Show completed work' }
  ];

  const generatePhotoId = () => {
    return `photo_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  };

  const handleFileSelect = (file: File, category: 'before' | 'during' | 'after') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const newPhoto: CapturedPhoto = {
        id: generatePhotoId(),
        file,
        preview,
        category,
        timestamp: new Date(),
        chairId,
        jobId
      };
      
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      onPhotoCapture(updatedPhotos);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (category: 'before' | 'during' | 'after') => {
    setActiveCategory(category);
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = (category: 'before' | 'during' | 'after') => {
    setActiveCategory(category);
    galleryInputRef.current?.click();
  };

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeCategory) {
      handleFileSelect(file, activeCategory);
    }
    setActiveCategory(null);
    // Reset input
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGalleryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeCategory) {
      handleFileSelect(file, activeCategory);
    }
    setActiveCategory(null);
    // Reset input
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotoCapture(updatedPhotos);
  };

  const handleRetakePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      handleRemovePhoto(photoId);
      setTimeout(() => handleCameraCapture(photo.category), 100);
    }
  };

  const getPhotosForCategory = (category: 'before' | 'during' | 'after') => {
    return photos.filter(photo => photo.category === category);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if device has camera capability
  const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  return (
    <PhotoCaptureContainer theme={theme} mode={mode}>
      <PhotoHeader theme={theme}>
        <PhotoTitle theme={theme}>
          📷 Service Documentation
          {required && <RequiredBadge theme={theme}>Required</RequiredBadge>}
        </PhotoTitle>
        <PhotoSubtitle theme={theme}>
          Capture photos to document the service process
        </PhotoSubtitle>
      </PhotoHeader>

      <PhotoContent theme={theme}>
        {categories.map((category) => {
          const categoryPhotos = getPhotosForCategory(category.key);
          
          return (
            <CategorySection key={category.key} theme={theme}>
              <CategoryTitle theme={theme}>
                <CategoryIcon category={category.key} />
                {category.label}
                <span style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.normal,
                  color: theme.colors.text.secondary,
                  marginLeft: theme.spacing.sm
                }}>
                  ({categoryPhotos.length} photo{categoryPhotos.length !== 1 ? 's' : ''})
                </span>
              </CategoryTitle>
              
              <p style={{ 
                margin: `0 0 ${theme.spacing.lg} 0`,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm
              }}>
                {category.description}
              </p>

              <PhotoGrid theme={theme}>
                {categoryPhotos.map((photo) => (
                  <PhotoSlot key={photo.id} theme={theme} hasPhoto={true} mode={mode}>
                    <PhotoImage theme={theme} src={photo.preview} alt={`${category.label} photo`} />
                    <PhotoActions theme={theme}>
                      <ActionButton
                        theme={theme}
                        onClick={() => handleRetakePhoto(photo.id)}
                        title="Retake photo"
                      >
                        📷
                      </ActionButton>
                      <ActionButton
                        theme={theme}
                        variant="remove"
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="Remove photo"
                      >
                        ×
                      </ActionButton>
                    </PhotoActions>
                    <PhotoTimestamp theme={theme}>
                      {formatTimestamp(photo.timestamp)}
                    </PhotoTimestamp>
                  </PhotoSlot>
                ))}
                
                {/* Add new photo slot */}
                <PhotoSlot theme={theme} hasPhoto={false} mode={mode}>
                  <PhotoPlaceholder theme={theme}>
                    <PhotoIcon theme={theme}>📷</PhotoIcon>
                    <PhotoText theme={theme}>Add Photo</PhotoText>
                  </PhotoPlaceholder>
                  
                  <CaptureButtons theme={theme}>
                    {hasCamera && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCameraCapture(category.key)}
                      >
                        📷 Camera
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleGallerySelect(category.key)}
                    >
                      📁 Gallery
                    </Button>
                  </CaptureButtons>
                </PhotoSlot>
              </PhotoGrid>
            </CategorySection>
          );
        })}

        {/* Summary */}
        <div style={{ 
          marginTop: theme.spacing.xl,
          padding: theme.spacing.lg,
          background: mode === 'dark' 
            ? 'rgba(51, 65, 85, 0.5)' 
            : theme.colors.gray[50],
          borderRadius: theme.borderRadius.lg,
          textAlign: 'center'
        }}>
          <strong>Total Photos: {photos.length}</strong>
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.sm
          }}>
            Before: {getPhotosForCategory('before').length} • 
            During: {getPhotosForCategory('during').length} • 
            After: {getPhotosForCategory('after').length}
          </div>
        </div>
      </PhotoContent>

      {/* Hidden file inputs */}
      <HiddenInput
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Use rear camera on mobile
        onChange={handleCameraInputChange}
      />
      
      <HiddenInput
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryInputChange}
      />
    </PhotoCaptureContainer>
  );
};