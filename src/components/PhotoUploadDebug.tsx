import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { uploadPhoto } from '../lib/firebase-storage';

const DebugContainer = styled.div`
  padding: ${theme.spacing.lg};
  border: 2px solid ${theme.colors.warning[300]};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.warning[50]};
  margin: ${theme.spacing.lg} 0;
`;

const DebugTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.warning[700]};
`;

const TestButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  margin-right: ${theme.spacing.sm};
  
  &:hover {
    background: ${theme.colors.primary[600]};
  }
  
  &:disabled {
    background: ${theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const DebugLog = styled.div`
  background: ${theme.colors.gray[900]};
  color: ${theme.colors.gray[100]};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-family: monospace;
  font-size: ${theme.typography.fontSize.sm};
  max-height: 200px;
  overflow-y: auto;
  margin-top: ${theme.spacing.md};
  white-space: pre-wrap;
`;

const HiddenInput = styled.input`
  display: none;
`;

export const PhotoUploadDebug: React.FC = () => {
  const [log, setLog] = useState<string>('Photo Upload Debug Tool\n\n');
  const [testing, setTesting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => prev + `[${timestamp}] ${message}\n`);
  };

  const testFirebaseConnection = async () => {
    setTesting(true);
    addLog('Testing Firebase Storage connection...');
    
    try {
      // Test with a simple text file
      const testFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
      const testPath = `debug/test_${Date.now()}.txt`;
      
      addLog(`Uploading test file to: ${testPath}`);
      
      const downloadURL = await uploadPhoto(testFile, testPath, (progress) => {
        addLog(`Upload progress: ${Math.round(progress)}%`);
      });
      
      addLog(`✅ SUCCESS! File uploaded to: ${downloadURL}`);
      addLog('Firebase Storage is working correctly.');
      
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog('Firebase Storage connection failed.');
      console.error('Firebase Storage test error:', error);
    } finally {
      setTesting(false);
    }
  };

  const testImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTesting(true);
    addLog(`Testing image upload: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file is not an image');
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)');
      }
      
      addLog('File validation passed');
      
      // Upload image
      const imagePath = `debug/images/test_${Date.now()}_${file.name}`;
      addLog(`Uploading to: ${imagePath}`);
      
      const downloadURL = await uploadPhoto(file, imagePath, (progress) => {
        addLog(`Upload progress: ${Math.round(progress)}%`);
      });
      
      addLog(`✅ SUCCESS! Image uploaded to: ${downloadURL}`);
      addLog('Image upload is working correctly.');
      
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Image upload test error:', error);
    } finally {
      setTesting(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearLog = () => {
    setLog('Photo Upload Debug Tool\n\n');
  };

  return (
    <DebugContainer>
      <DebugTitle>🔧 Photo Upload Debug Tool</DebugTitle>
      <p>Use this tool to test photo upload functionality and diagnose issues.</p>
      
      <div>
        <TestButton onClick={testFirebaseConnection} disabled={testing}>
          Test Firebase Connection
        </TestButton>
        <TestButton onClick={testImageUpload} disabled={testing}>
          Test Image Upload
        </TestButton>
        <TestButton onClick={clearLog} disabled={testing}>
          Clear Log
        </TestButton>
      </div>
      
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
      
      <DebugLog>{log}</DebugLog>
    </DebugContainer>
  );
};