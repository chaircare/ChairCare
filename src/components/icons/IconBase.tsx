import React from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface IconBaseProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

/**
 * Base component for all custom icons
 * Provides consistent sizing, coloring, and accessibility
 */
export const IconBase: React.FC<IconBaseProps> = ({
  size = 24,
  color = 'currentColor',
  className,
  style,
  children,
  viewBox = '0 0 24 24'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role="img"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
};