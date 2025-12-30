import React from 'react';
import { IconBase, IconProps } from './IconBase';

/**
 * Custom QR Scanner Icon Component
 * Represents QR code scanning functionality
 */
export const QRScannerIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props}>
      {/* QR Code corners */}
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      {/* QR Code pattern */}
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      <rect x="15" y="15" width="1" height="1" />
      <rect x="13" y="13" width="1" height="1" />
    </IconBase>
  );
};