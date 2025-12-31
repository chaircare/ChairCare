import React from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const StyledCard = styled.div<CardProps>`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.gray[200]};
  transition: all 0.2s ease-in-out;
  
  ${({ padding = 'md' }) => {
    switch (padding) {
      case 'sm':
        return `
          padding: ${theme.spacing.md};
          @media (max-width: 768px) {
            padding: ${theme.spacing.sm};
          }
        `;
      case 'lg':
        return `
          padding: ${theme.spacing['2xl']};
          @media (max-width: 768px) {
            padding: ${theme.spacing.xl};
          }
          @media (max-width: 480px) {
            padding: ${theme.spacing.lg};
          }
        `;
      default:
        return `
          padding: ${theme.spacing.xl};
          @media (max-width: 768px) {
            padding: ${theme.spacing.lg};
          }
          @media (max-width: 480px) {
            padding: ${theme.spacing.md};
          }
        `;
    }
  }}
  
  ${({ shadow = 'sm' }) => {
    switch (shadow) {
      case 'md':
        return `box-shadow: ${theme.shadows.md};`;
      case 'lg':
        return `box-shadow: ${theme.shadows.lg};`;
      default:
        return `box-shadow: ${theme.shadows.sm};`;
    }
  }}
  
  ${({ hover }) => hover && `
    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
`;

const CardContent = styled.div`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Content: typeof CardContent;
} = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;