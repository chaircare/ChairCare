import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Button } from 'components/ui/Button';
import { Logo } from 'components/ui/Logo';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  accentText?: string;
  description?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  showDecorative?: boolean;
}

const HeroContainer = styled.div<{ theme: any }>`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.dark
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(3, 105, 161, 0.05) 50%, rgba(248, 250, 252, 1) 100%)'
  };
  padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    min-height: 70vh;
    padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  }
`;

const HeroContent = styled.div<{ theme: any }>`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['4xl']};
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing['2xl']};
    text-align: center;
  }
`;

const TextContent = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Greeting = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MainTitle = styled.h1<{ theme: any }>`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
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
  display: block;
  margin-top: ${props => props.theme.spacing.sm};
`;

const Description = styled.p<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  max-width: 600px;
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled(Button)<{ theme: any }>`
  background: ${props => props.theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme.shadows.professional};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.professionalHover};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const SecondaryButton = styled(Button)<{ theme: any }>`
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[500]};
    color: white;
    border-color: ${props => props.theme.colors.primary[500]};
    transform: translateY(-2px);
  }
`;

const DecorativeSection = styled.div<{ theme: any }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    margin-top: ${props => props.theme.spacing['2xl']};
  }
`;

const DecorativeElement = styled.div<{ theme: any; delay?: number }>`
  width: 80px;
  height: 80px;
  background: ${props => props.theme.gradients.purple};
  border-radius: 50%;
  position: absolute;
  animation: float 6s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
  opacity: 0.8;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: ${props => props.theme.colors.background.primary};
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: ${props => props.theme.gradients.purple};
    border-radius: 50%;
  }
`;

const GearOne = styled(DecorativeElement)`
  top: 20%;
  right: 20%;
  width: 60px;
  height: 60px;
`;

const GearTwo = styled(DecorativeElement)`
  top: 50%;
  right: 10%;
  width: 70px;
  height: 70px;
`;

const GearThree = styled(DecorativeElement)`
  top: 70%;
  right: 25%;
  width: 55px;
  height: 55px;
`;

const LogoSection = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  @media (max-width: 768px) {
    order: -1;
    margin-bottom: ${props => props.theme.spacing.xl};
  }
`;

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  accentText,
  description,
  primaryAction,
  secondaryAction,
  showDecorative = true
}) => {
  const { theme, mode } = useTheme();

  return (
    <HeroContainer theme={theme}>
      <HeroContent theme={theme}>
        <TextContent theme={theme}>
          {subtitle && (
            <Greeting theme={theme}>
              {subtitle}
            </Greeting>
          )}
          
          <MainTitle theme={theme}>
            {title}
            {accentText && (
              <AccentText theme={theme}>
                {accentText}
              </AccentText>
            )}
          </MainTitle>
          
          {description && (
            <Description theme={theme}>
              {description}
            </Description>
          )}
          
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
        </TextContent>
        
        <DecorativeSection theme={theme}>
          <LogoSection theme={theme}>
            <Logo variant={mode} size="lg" showText={true} />
          </LogoSection>
          
          {showDecorative && (
            <>
              <GearOne theme={theme} delay={0} />
              <GearTwo theme={theme} delay={2} />
              <GearThree theme={theme} delay={4} />
            </>
          )}
        </DecorativeSection>
      </HeroContent>
    </HeroContainer>
  );
};