import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Button } from 'components/ui/Button';

interface CompactHeroProps {
  title: string;
  subtitle?: string;
  accentText?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

const CompactContainer = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.dark
    : 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(248, 250, 252, 1) 100%)'
  };
  border-radius: ${props => props.theme.borderRadius['2xl']};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.theme.gradients.accent};
  }
`;

const CompactContent = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const TextContent = styled.div<{ theme: any }>`
  flex: 1;
`;

const Greeting = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Title = styled.h1<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  letter-spacing: ${props => props.theme.typography.letterSpacing.tight};
`;

const AccentText = styled.span<{ theme: any }>`
  background: ${props => props.theme.gradients.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline;
  margin-left: ${props => props.theme.spacing.sm};
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(Button)<{ theme: any }>`
  background: ${props => props.theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme.shadows.professional};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.professionalHover};
  }
`;

const SecondaryButton = styled(Button)<{ theme: any }>`
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[500]};
    color: white;
    border-color: ${props => props.theme.colors.primary[500]};
    transform: translateY(-2px);
  }
`;

export const CompactHero: React.FC<CompactHeroProps> = ({
  title,
  subtitle,
  accentText,
  primaryAction,
  secondaryAction
}) => {
  const { theme } = useTheme();

  return (
    <CompactContainer theme={theme}>
      <CompactContent theme={theme}>
        <TextContent theme={theme}>
          {subtitle && (
            <Greeting theme={theme}>
              {subtitle}
            </Greeting>
          )}
          
          <Title theme={theme}>
            {title}
            {accentText && (
              <AccentText theme={theme}>
                {accentText}
              </AccentText>
            )}
          </Title>
        </TextContent>
        
        {(primaryAction || secondaryAction) && (
          <ActionButtons theme={theme}>
            {primaryAction && (
              <PrimaryButton theme={theme} onClick={primaryAction.onClick}>
                {primaryAction.text}
              </PrimaryButton>
            )}
            
            {secondaryAction && (
              <SecondaryButton theme={theme} onClick={secondaryAction.onClick}>
                {secondaryAction.text}
              </SecondaryButton>
            )}
          </ActionButtons>
        )}
      </CompactContent>
    </CompactContainer>
  );
};