import React from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';

interface InputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<InputProps & { hasError?: boolean }>`
  width: 100%;
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  border: 1px solid ${({ hasError }) => hasError ? theme.colors.error[300] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  transition: all 0.2s ease-in-out;
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          height: 2rem;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          height: 3rem;
        `;
      default:
        return `
          padding: ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
          height: 2.5rem;
        `;
    }
  }}
  
  ${({ icon }) => icon && `padding-left: 2.5rem;`}
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  color: ${theme.colors.gray[400]};
  pointer-events: none;
  z-index: 1;
`;

const ErrorMessage = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error[600]};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
`;

export const Input: React.FC<InputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  error,
  fullWidth,
  icon,
  ...props
}) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput {...props} hasError={!!error} icon={icon} />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};