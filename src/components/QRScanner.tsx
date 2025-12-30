import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { Button } from './ui/Button';

// QR Code scanning interface
interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
}

const ScannerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  background: ${theme.colors.gray[900]};
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ScanFrame = styled.div`
  width: 200px;
  height: 200px;
  border: 2px solid ${theme.colors.primary[500]};
  border-radius: ${theme.borderRadius.lg};
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid ${theme.colors.primary[500]};
  }
  
  &::before {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }
`;

const StatusMessage = styled.div<{ type: 'info' | 'error' | 'success' }>`
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.type) {
      case 'error':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
          border: 1px solid ${theme.colors.error[200]};
        `;
      case 'success':
        return `
          background: ${theme.colors.success[50]};
          color: ${theme.colors.success[700]};
          border: 1px solid ${theme.colors.success[200]};
        `;
      default:
        return `
          background: ${theme.colors.primary[50]};
          color: ${theme.colors.primary[700]};
          border: 1px solid ${theme.colors.primary[200]};
        `;
    }
  }}
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  justify-content: center;
`;

const ManualInput = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: ${theme.spacing.md};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

export const QRScanner: React.FC<QRScannerProps> = ({ 
  onScan, 
  onError, 
  isActive = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const showStatus = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 3000);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setStatusMessage('Starting camera...');
      setStatusType('info');
      
      // Import QrScanner dynamically to avoid SSR issues
      const QrScanner = (await import('qr-scanner')).default;
      
      if (!videoRef.current) return;
      
      // Create QR scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setIsScanning(false);
          showStatus(`QR Code detected: ${result.data}`, 'success');
          onScan(result.data);
          
          // Stop scanning after successful detection
          if (scannerRef.current) {
            scannerRef.current.stop();
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera on mobile
        }
      );
      
      await scannerRef.current.start();
      setHasPermission(true);
      setIsScanning(true);
      showStatus('Camera ready - point at QR code', 'success');
      
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);
      const errorMessage = error instanceof Error ? error.message : 'Camera access denied';
      showStatus(`Camera error: ${errorMessage}`, 'error');
      onError?.(errorMessage);
    }
  }, [onError, showStatus, onScan]);

  const stopCamera = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    
    setIsScanning(false);
    setHasPermission(null);
  }, []);

  const startScanning = useCallback(() => {
    if (scannerRef.current && !isScanning) {
      scannerRef.current.start();
      setIsScanning(true);
      showStatus('Scanning for QR codes...', 'info');
    } else if (!scannerRef.current) {
      startCamera();
    }
  }, [isScanning, startCamera, showStatus]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setIsScanning(false);
    showStatus('Scanning stopped', 'info');
  }, [showStatus]);

  const handleManualSubmit = useCallback(() => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      setShowManualInput(false);
      showStatus(`Manual input: ${manualInput.trim()}`, 'success');
    }
  }, [manualInput, onScan, showStatus]);

  // Initialize camera when component mounts and is active
  useEffect(() => {
    if (isActive && hasPermission === null) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive, hasPermission, startCamera, stopCamera]);

  return (
    <ScannerContainer>
      <VideoContainer>
        <Video
          ref={videoRef}
          playsInline
          muted
          style={{ display: hasPermission ? 'block' : 'none' }}
        />
        
        {hasPermission && (
          <Overlay>
            <ScanFrame />
          </Overlay>
        )}
        
        {hasPermission === false && (
          <Overlay>
            <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <div>Camera access required</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Please allow camera access to scan QR codes
              </div>
            </div>
          </Overlay>
        )}
      </VideoContainer>

      {statusMessage && (
        <StatusMessage type={statusType}>
          {statusMessage}
        </StatusMessage>
      )}

      <ControlsContainer>
        {hasPermission && (
          <>
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? 'secondary' : 'primary'}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
            
            <Button
              onClick={() => setShowManualInput(!showManualInput)}
              variant="outline"
            >
              Manual Entry
            </Button>
          </>
        )}
        
        {hasPermission === false && (
          <Button onClick={startCamera} variant="primary">
            Enable Camera
          </Button>
        )}
      </ControlsContainer>

      {showManualInput && (
        <ManualInput>
          <h4 style={{ margin: '0 0 1rem 0' }}>Enter Chair ID Manually</h4>
          <Input
            type="text"
            placeholder="Enter Chair ID (e.g., CC-000123)"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={handleManualSubmit} variant="primary" size="sm">
              Submit
            </Button>
            <Button 
              onClick={() => {
                setShowManualInput(false);
                setManualInput('');
              }} 
              variant="outline" 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </ManualInput>
      )}
    </ScannerContainer>
  );
};