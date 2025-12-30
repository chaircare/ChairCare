import React, { useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { uploadPhoto, deletePhoto } from '../lib/firebase-storage';

interface PhotoUploadProps {
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
  category?: 'before' | 'after' | 'general';
  chairId?: string;
  jobId?: string;
  existingPhotos?: UploadedPhoto[];
}

export interface UploadedPhoto {
  id: string;
  url: string;
  filename: string;
  category: 'before' | 'after' | 'general';
  uploadedAt: Date;
  size: number;
}

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const UploadArea = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? theme.colors.primary[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  background: ${props => props.isDragOver ? theme.colors.primary[50] : theme.colors.background.primary};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary[500]};
    background: ${theme.colors.primary[50]};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
`;

const UploadText = styled.div`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const UploadSubtext = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  background: ${theme.colors.gray[100]};
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${PhotoItem}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  background: ${theme.colors.error[500]};
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background: ${theme.colors.error[600]};
  }
`;

const UploadProgress = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${theme.colors.gray[200]};
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${theme.colors.primary[500]};
    transition: width 0.3s ease;
  }
`;

const PhotoInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
`;

const CategoryBadge = styled.span<{ category: string }>`
  position: absolute;
  top: ${theme.spacing.xs};
  right: ${theme.spacing.xs};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.category) {
      case 'before':
        return `
          background: ${theme.colors.warning[500]};
          color: white;
        `;
      case 'after':
        return `
          background: ${theme.colors.success[500]};
          color: white;
        `;
      default:
        return `
          background: ${theme.colors.primary[500]};
          color: white;
        `;
    }
  }}
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[600]};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.error[50]};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.error[200]};
`;

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 10,
  category = 'general',
  chairId,
  jobId,
  existingPhotos = []
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(existingPhotos);
  const [uploading, setUploading] = useState<{ [key: string]: number }>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback((file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadedPhoto | null> => {
    try {
      setError('');
      
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const filename = `${timestamp}_${randomId}_${file.name}`;
      
      // Create upload path
      const path = chairId && jobId 
        ? `chairs/${chairId}/jobs/${jobId}/${category}/${filename}`
        : `photos/${category}/${filename}`;
      
      // Track upload progress
      const uploadId = `${timestamp}_${randomId}`;
      setUploading(prev => ({ ...prev, [uploadId]: 0 }));
      
      // Upload to Firebase Storage
      const downloadURL = await uploadPhoto(
        compressedFile,
        path,
        (progress: number) => {
          setUploading(prev => ({ ...prev, [uploadId]: progress }));
        }
      );
      
      // Remove from uploading state
      setUploading(prev => {
        const newState = { ...prev };
        delete newState[uploadId];
        return newState;
      });
      
      // Create photo object
      const photo: UploadedPhoto = {
        id: uploadId,
        url: downloadURL,
        filename: file.name,
        category,
        uploadedAt: new Date(),
        size: compressedFile.size
      };
      
      return photo;
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [compressImage, category, chairId, jobId]);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    // Check photo limit
    if (photos.length + validFiles.length > maxPhotos) {
      setError(`Cannot upload more than ${maxPhotos} photos`);
      return;
    }
    
    // Upload files
    const uploadPromises = validFiles.map(uploadFile);
    const uploadedPhotos = await Promise.all(uploadPromises);
    
    // Filter out failed uploads and update state
    const successfulUploads = uploadedPhotos.filter((photo): photo is UploadedPhoto => photo !== null);
    const newPhotos = [...photos, ...successfulUploads];
    
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  }, [photos, maxPhotos, uploadFile, onPhotosChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleDeletePhoto = useCallback(async (photo: UploadedPhoto) => {
    try {
      // Delete from Firebase Storage
      await deletePhoto(photo.url);
      
      // Remove from state
      const newPhotos = photos.filter(p => p.id !== photo.id);
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [photos, onPhotosChange]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <UploadContainer>
      <UploadArea
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <UploadIcon>📷</UploadIcon>
        <UploadText>
          {category === 'before' && 'Upload Before Photos'}
          {category === 'after' && 'Upload After Photos'}
          {category === 'general' && 'Upload Photos'}
        </UploadText>
        <UploadSubtext>
          Drag and drop images here, or click to select files
          <br />
          Max {maxPhotos} photos, 10MB each
        </UploadSubtext>
      </UploadArea>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {(photos.length > 0 || Object.keys(uploading).length > 0) && (
        <PhotoGrid>
          {photos.map((photo) => (
            <PhotoItem key={photo.id}>
              <PhotoImage src={photo.url} alt={photo.filename} />
              <CategoryBadge category={photo.category}>
                {photo.category}
              </CategoryBadge>
              <PhotoOverlay>
                <DeleteButton onClick={() => handleDeletePhoto(photo)}>
                  ×
                </DeleteButton>
              </PhotoOverlay>
              <PhotoInfo>
                {photo.filename}
                <br />
                {(photo.size / 1024).toFixed(1)}KB
              </PhotoInfo>
            </PhotoItem>
          ))}
          
          {Object.entries(uploading).map(([id, progress]) => (
            <PhotoItem key={id}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                background: theme.colors.gray[100]
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div style={{ fontSize: '0.8rem' }}>Uploading...</div>
                  <div style={{ fontSize: '0.8rem' }}>{Math.round(progress)}%</div>
                </div>
              </div>
              <UploadProgress progress={progress} />
            </PhotoItem>
          ))}
        </PhotoGrid>
      )}

      <div style={{ 
        marginTop: theme.spacing.md, 
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center'
      }}>
        {photos.length} of {maxPhotos} photos uploaded
      </div>
    </UploadContainer>
  );
};