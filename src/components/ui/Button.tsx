import React from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  font-weight: ${theme.typography.fontWeight.medium};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 2rem;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 3rem;
        `;
      default:
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
          min-height: 2.5rem;
        `;
    }
  }}
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
          border: 1px solid ${theme.colors.gray[300]};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.gray[200]};
            border-color: ${theme.colors.gray[400]};
          }
        `;
      case 'success':
        return `
          background: ${theme.colors.success[500]};
          color: ${theme.colors.text.inverse};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.success[600]};
          }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning[500]};
          color: ${theme.colors.text.inverse};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.warning[600]};
          }
        `;
      case 'error':
        return `
          background: ${theme.colors.error[500]};
          color: ${theme.colors.text.inverse};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.error[600]};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.primary[600]};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary[50]};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.primary[600]};
          border: 1px solid ${theme.colors.primary[300]};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary[50]};
            border-color: ${theme.colors.primary[400]};
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%);
          color: ${theme.colors.text.inverse};
          box-shadow: ${theme.shadows.sm};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
            box-shadow: ${theme.shadows.md};
            transform: translateY(-1px);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  disabled,
  ...props 
}) => {
  return (
    <StyledButton {...props} disabled={disabled || loading}>
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};