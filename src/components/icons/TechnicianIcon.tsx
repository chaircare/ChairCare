import React from 'react';
import { IconBase, IconProps } from './IconBase';

/**
 * Custom Technician Icon Component
 * Represents technician/worker functionality
 */
export const TechnicianIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props}>
      {/* Person head */}
      <circle cx="12" cy="7" r="4" />
      {/* Person body */}
      <path d="M5.5 21v-2a7.5 7.5 0 0 1 13 0v2" />
      {/* Tool/wrench */}
      <path d="M16 11l1.5 1.5-2.5 2.5L13.5 13l2.5-2z" />
      <circle cx="17.5" cy="9.5" r="1.5" />
    </IconBase>
  );
};