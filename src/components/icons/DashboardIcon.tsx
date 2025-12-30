import React from 'react';
import { IconBase, IconProps } from './IconBase';

/**
 * Custom Dashboard Icon Component
 * Can be used as an alternative to Flaticon
 */
export const DashboardIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </IconBase>
  );
};