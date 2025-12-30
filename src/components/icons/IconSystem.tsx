import React from 'react';
import styled from '@emotion/styled';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const IconWrapper = styled.span<{ size: number; color?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  color: ${props => props.color || 'currentColor'};
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

// Dashboard Icons
export const DashboardIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Chair Icons
export const ChairIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11v2h10v-2H7zm0-4V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H5c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h2zm2-2v2h6V5H9z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// QR Scanner Icon
export const QRScannerIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4a2 2 0 0 0-2-2h-3v2h3v3h2V7zM7 2H4a2 2 0 0 0-2 2v3h2V4h3V2zM2 17h2v3h3v2H4a2 2 0 0 1-2-2v-3zm20 0h-2v3h-3v2h3a2 2 0 0 0 2-2v-3z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Technician Icon
export const TechnicianIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H7V9C7 11.8 9.2 14 12 14S17 11.8 17 9V7H21V9H19V11C19 12.1 18.1 13 17 13V22H15V13H9V22H7V13C5.9 13 5 12.1 5 11V9H3V7H7V9C7 10.7 8.3 12 10 12H14C15.7 12 17 10.7 17 9Z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Job Management Icon
export const JobIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Service Request Icon
export const ServiceRequestIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Users Icon
export const UsersIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4.5c0-1.1.9-2 2-2s2 .9 2 2V18h4v-5c0-1.1.9-2 2-2s2 .9 2 2v5h4v-7.5c0-1.1.9-2 2-2s2 .9 2 2V18h2v2H2v-2h2z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Analytics Icon
export const AnalyticsIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Settings Icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Logout Icon
export const LogoutIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Add Icon
export const AddIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// List Icon
export const ListIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Money/Invoice Icon
export const MoneyIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Email Icon
export const EmailIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Building/Company Icon
export const BuildingIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Inventory Icon
export const InventoryIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zM19 20H5V9h14v11zM20 7H4V4h16v3z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Theme Toggle Icons
export const SunIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);

// Back Arrow Icon
export const BackIcon: React.FC<IconProps> = ({ size = 20, color, className }) => (
  <IconWrapper size={size} color={color} className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
    </svg>
  </IconWrapper>
);