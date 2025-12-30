import React from 'react';
import { IconBase, IconProps } from './IconBase';

/**
 * Custom Chair Icon Component
 * Represents office chairs in the application
 */
export const ChairIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props}>
      {/* Chair back */}
      <path d="M6 2h12v8H6z" />
      {/* Chair seat */}
      <path d="M4 10h16v4H4z" />
      {/* Chair legs */}
      <line x1="8" y1="14" x2="8" y2="22" />
      <line x1="16" y1="14" x2="16" y2="22" />
      {/* Chair base */}
      <line x1="6" y1="22" x2="10" y2="22" />
      <line x1="14" y1="22" x2="18" y2="22" />
      {/* Armrests */}
      <path d="M4 8v6" />
      <path d="M20 8v6" />
    </IconBase>
  );
};