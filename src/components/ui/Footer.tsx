import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Logo } from 'components/ui/Logo';
import { EmailIcon, BuildingIcon } from 'components/icons/IconSystem';

const FooterContainer = styled.footer<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  };
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  padding: ${props => props.theme.spacing['2xl']} 0 ${props => props.theme.spacing.xl} 0;
  margin-top: auto;
`;

const FooterContent = styled.div<{ theme: any }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

const FooterGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.xl};
    text-align: center;
  }
`;

const FooterSection = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const SectionContent = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const ContactItem = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ContactLink = styled.a<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary[600]};
  }
`;

const FeatureList = styled.ul<{ theme: any }>`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:before {
    content: '✓';
    color: ${props => props.theme.colors.success[500]};
    font-weight: bold;
    margin-right: ${props => props.theme.spacing.sm};
  }
`;

const FooterDivider = styled.div<{ theme: any }>`
  height: 1px;
  background: ${props => props.theme.colors.border.primary};
  margin: ${props => props.theme.spacing.xl} 0;
`;

const FooterBottom = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: ${props => props.theme.spacing.md};
  }
`;

const CopyrightText = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DeveloperSection = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const DeveloperText = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const DeveloperLink = styled.a<{ theme: any }>`
  color: ${props => props.theme.colors.primary[600]};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary[700]};
    text-decoration: underline;
  }
`;

const StudioBadge = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(59, 130, 246, 0.2)' 
    : 'rgba(59, 130, 246, 0.1)'
  };
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const StudioIcon = styled.div<{ theme: any }>`
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const CompanyInfo = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CompanyDescription = styled.p<{ theme: any }>`
  margin: ${props => props.theme.spacing.md} 0 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

export const Footer: React.FC = () => {
  const { theme, mode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer theme={theme}>
      <FooterContent theme={theme}>
        <FooterGrid theme={theme}>
          {/* Company Information */}
          <FooterSection theme={theme}>
            <CompanyInfo theme={theme}>
              <Logo variant={mode} size="sm" showText={true} />
              <CompanyDescription theme={theme}>
                smart Seating solutions that bring comfort and function back to your workspace.
              </CompanyDescription>
            </CompanyInfo>
            
            <SectionTitle theme={theme}>Contact Information</SectionTitle>
            <SectionContent theme={theme}>
              <ContactItem theme={theme}>
                <EmailIcon size={16} />
                <ContactLink theme={theme} href="mailto:support@chaircare.co.za">
                  support@chaircare.co.za

                </ContactLink>
              </ContactItem>
              
              <ContactItem theme={theme}>
                <BuildingIcon size={16} />
                <span>South Africa</span>
              </ContactItem>
              
              <ContactItem theme={theme}>
                <span>📞</span>
                <ContactLink theme={theme} href="tel:+27 68 616 1364">
                  +27 68 616 1364
                </ContactLink>
              </ContactItem>
            </SectionContent>
          </FooterSection>

          {/* Features */}
          <FooterSection theme={theme}>
            <SectionTitle theme={theme}>Key Features</SectionTitle>
            <SectionContent theme={theme}>
              <FeatureList theme={theme}>
                <FeatureItem theme={theme}>QR Code Chair Tracking</FeatureItem>
                <FeatureItem theme={theme}>Service Request Management</FeatureItem>
                <FeatureItem theme={theme}>Technician Job Scheduling</FeatureItem>
                <FeatureItem theme={theme}>Client Portal Access</FeatureItem>
                <FeatureItem theme={theme}>Real-time Status Updates</FeatureItem>
                <FeatureItem theme={theme}>Comprehensive Reporting</FeatureItem>
                <FeatureItem theme={theme}>Mobile-First Design</FeatureItem>
                <FeatureItem theme={theme}>Enterprise Security</FeatureItem>
              </FeatureList>
            </SectionContent>
          </FooterSection>

          {/* System Information */}
          <FooterSection theme={theme}>
            <SectionTitle theme={theme}>System Information</SectionTitle>
            <SectionContent theme={theme}>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Version:</strong> 1.0.0 Beta
              </div>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-ZA')}
              </div>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Environment:</strong> Production Ready
              </div>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Security:</strong> Enterprise Grade
              </div>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Uptime:</strong> 99.9% SLA
              </div>
              <div style={{ marginBottom: theme.spacing.md }}>
                <strong>Support:</strong> 24/7 Available
              </div>
            </SectionContent>
          </FooterSection>
        </FooterGrid>

        <FooterDivider theme={theme} />

        <FooterBottom theme={theme}>
          <CopyrightText theme={theme}>
            © {currentYear} All rights reserved. Chair Care.
          </CopyrightText>

          <DeveloperSection theme={theme}>
            <DeveloperText theme={theme}>
              Developed by{' '}
              <DeveloperLink 
                theme={theme} 
                href="https://linkedin.com/in/franco-lukhele" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Franco Lukhele
              </DeveloperLink>
            </DeveloperText>
            
            <StudioBadge theme={theme}>
              <StudioIcon theme={theme}>A</StudioIcon>
              <DeveloperLink 
                theme={theme} 
                href="https://alchemystudio.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                AlchemyStudio
              </DeveloperLink>
            </StudioBadge>
          </DeveloperSection>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};