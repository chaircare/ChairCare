# Icon Usage Guide

This guide shows you how to use the different types of icons in your Chair Care application.

## 1. Using Custom React Icon Components

```jsx
import { DashboardIcon, ChairIcon, QRScannerIcon } from 'components/icons';

function MyComponent() {
  return (
    <div>
      <DashboardIcon size={24} color="#0ea5e9" />
      <ChairIcon size={32} />
      <QRScannerIcon size={20} color="red" />
    </div>
  );
}
```

## 2. Using SVG Files from Public Folder

```jsx
function MyComponent() {
  return (
    <img 
      src="/icons/svg/chair-repair.svg" 
      alt="Chair Repair" 
      width={24} 
      height={24}
      style={{ color: '#0ea5e9' }}
    />
  );
}
```

## 3. Using Flaticon Classes (Already Configured)

```jsx
function MyComponent() {
  return (
    <i className="fi fi-br-dashboard-panel" style={{ fontSize: '24px' }}></i>
  );
}
```

## 4. Using the Icon Utility System

The Layout component uses the icon utility system which allows you to easily switch between different icon types:

```jsx
import { renderNavigationIcon } from 'utils/iconUtils';

// In your component
{renderNavigationIcon('dashboard', 'flaticon', 16)}
{renderNavigationIcon('dashboard', 'custom', 16)}
{renderNavigationIcon('dashboard', 'emoji', 16)}
```

## 5. Adding New Custom Icons

### Step 1: Create the Icon Component

```jsx
// src/components/icons/MyNewIcon.tsx
import React from 'react';
import { IconBase, IconProps } from './IconBase';

export const MyNewIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props}>
      {/* Your SVG paths here */}
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </IconBase>
  );
};
```

### Step 2: Export from Index

```jsx
// src/components/icons/index.ts
export { MyNewIcon } from './MyNewIcon';
```

### Step 3: Add to Icon Utils (Optional)

```jsx
// src/utils/iconUtils.tsx
export const navigationIcons: Record<string, IconConfig> = {
  // ... existing icons
  myNewItem: {
    flaticon: '<i class="fi fi-br-my-icon"></i>',
    custom: MyNewIcon,
    emoji: '⭐'
  }
};
```

## Icon Sizing Guidelines

- **Small**: 16px - Navigation items, inline icons
- **Medium**: 24px - Buttons, form elements  
- **Large**: 32px - Headers, feature highlights
- **Extra Large**: 48px+ - Hero sections, empty states

## Color Guidelines

- Use `currentColor` for icons that should inherit text color
- Use theme colors for branded icons: `theme.colors.primary[500]`
- Use semantic colors for status icons: `theme.colors.success[500]`

## Accessibility

All custom icon components include:
- `role="img"` attribute
- `aria-hidden="true"` for decorative icons
- Proper sizing and contrast ratios

For icons that convey meaning, add appropriate `aria-label` attributes:

```jsx
<DashboardIcon aria-label="Dashboard" role="img" />
```