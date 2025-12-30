# Icon Components

This folder contains React components for custom icons used throughout the Chair Care application.

## Usage

Import and use icon components in your React components:

```jsx
import { ChairIcon } from 'components/icons/ChairIcon';
import { QRScannerIcon } from 'components/icons/QRScannerIcon';

function MyComponent() {
  return (
    <div>
      <ChairIcon size={24} color="#0ea5e9" />
      <QRScannerIcon size={32} />
    </div>
  );
}
```

## Component Structure

Each icon component should follow this pattern:

```jsx
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ChairIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* SVG path content */}
    </svg>
  );
};
```

## Icon Types Needed

- Chair repair tools
- QR code scanner
- Dashboard panels
- Technician badges
- Service status indicators
- Job progress icons