// Firebase Storage utilities for photo uploads
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a photo to Firebase Storage with progress tracking
 */
export const uploadPhoto = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Delete a photo from Firebase Storage
 */
export const deletePhoto = async (downloadURL: string): Promise<void> => {
  try {
    // Extract the path from the download URL
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid download URL format');
    }
    
    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Upload multiple photos with progress tracking
 */
export const uploadMultiplePhotos = async (
  files: File[],
  basePath: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const filename = `${Date.now()}_${index}_${file.name}`;
    const path = `${basePath}/${filename}`;
    
    return uploadPhoto(file, path, (progress) => {
      onProgress?.(index, progress);
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * Generate a unique filename for uploads
 */
export const generateUniqueFilename = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  
  return prefix 
    ? `${prefix}_${timestamp}_${randomId}.${extension}`
    : `${timestamp}_${randomId}.${extension}`;
};

/**
 * Compress an image file before upload
 */
export const compressImage = (
  file: File, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas with new dimensions
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      resolve(file); // Fallback to original file
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File type not supported. Use JPG, PNG, GIF, or WebP' };
  }
  
  return { valid: true };
};

/**
 * Get storage path for chair photos
 */
export const getChairPhotoPath = (
  chairId: string, 
  jobId: string, 
  category: 'before' | 'after' | 'general',
  filename: string
): string => {
  return `chairs/${chairId}/jobs/${jobId}/${category}/${filename}`;
};

/**
 * Get storage path for job photos
 */
export const getJobPhotoPath = (
  jobId: string, 
  category: 'before' | 'after' | 'general',
  filename: string
): string => {
  return `jobs/${jobId}/${category}/${filename}`;
};

/**
 * Get storage path for general photos
 */
export const getGeneralPhotoPath = (
  category: string,
  filename: string
): string => {
  return `photos/${category}/${filename}`;
};