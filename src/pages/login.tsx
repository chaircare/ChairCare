import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme, ThemeToggle } from 'contexts/ThemeContext';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';
import { Logo } from 'components/ui/Logo';
import { Footer } from 'components/ui/Footer';

const LoginContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.dark
    : 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(248, 250, 252, 1) 100%)'
  };
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 40%;
    height: 200%;
    background: ${props => props.theme.mode === 'dark' 
      ? 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)'
    };
    animation: float 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 30%;
    height: 150%;
    background: ${props => props.theme.mode === 'dark' 
      ? 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(34, 211, 238, 0.05) 0%, transparent 70%)'
    };
    animation: float 10s ease-in-out infinite reverse;
  }
`;

const LoginContent = styled.div<{ theme: any }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  position: relative;
`;

const ThemeToggleContainer = styled.div<{ theme: any }>`
  position: absolute;
  top: ${props => props.theme.spacing.xl};
  right: ${props => props.theme.spacing.xl};
  z-index: 10;
`;

const LoginCard = styled(Card)<{ theme: any }>`
  width: 100%;
  max-width: 480px;
  text-align: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.9)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? props.theme.shadows.darkLg
    : props.theme.shadows['2xl']
  };
  backdrop-filter: blur(20px);
  border-radius: ${props => props.theme.borderRadius['3xl']};
  position: relative;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.theme.gradients.accent};
    border-radius: ${props => props.theme.borderRadius['3xl']} ${props => props.theme.borderRadius['3xl']} 0 0;
  }
`;

const LogoSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing['2xl']};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const WelcomeText = styled.div<{ theme: any }>`
  margin: ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Form = styled.form<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.error[600]};
  background: ${props => props.theme.colors.error[50]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SuccessMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.success[600]};
  background: ${props => props.theme.colors.success[50]};
  border: 1px solid ${props => props.theme.colors.success[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DemoSection = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing['2xl']};
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const DemoTitle = styled.h4<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const DemoGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;

const DemoCredential = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const DemoLabel = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const DemoRole = styled.span<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DemoEmail = styled.span<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const DemoButton = styled.button<{ theme: any }>`
  background: ${props => props.theme.gradients.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
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

const AccessSection = styled.div<{ theme: any }>`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const AccessText = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SecurityNote = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(59, 130, 246, 0.1)' 
    : props.theme.colors.primary[50]
  };
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.primary[200]};
`;

const SecurityText = styled.p<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.primary[700]};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const LoginPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { theme, mode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Check for success message from registration
    if (router.query.success === 'registered') {
      setSuccess('Account created successfully! Please sign in with your credentials.');
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'client' | 'technician') => {
    setError('');
    setSuccess('');
    
    switch (role) {
      case 'admin':
        setEmail('admin@chaircare.co.za');
        setPassword('ChairCare2024!');
        break;
      case 'client':
        setEmail('client@company.co.za');
        setPassword('ClientDemo2024!');
        break;
      case 'technician':
        setEmail('tech@chaircare.co.za');
        setPassword('TechDemo2024!');
        break;
    }
  };

  return (
    <LoginContainer theme={theme}>
      <LoginContent theme={theme}>
        <ThemeToggleContainer theme={theme}>
          <ThemeToggle />
        </ThemeToggleContainer>
        
        <LoginCard theme={theme}>
          <Card.Content>
            <LogoSection theme={theme}>
              <Logo variant={mode} size="lg" showText={true} />
              <WelcomeText theme={theme}>
                Welcome back! Please sign in to access your account.
              </WelcomeText>
            </LogoSection>

            <Form theme={theme} onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                fullWidth
                required
                autoComplete="email"
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                fullWidth
                required
                autoComplete="current-password"
              />
              
              <Button 
                type="submit" 
                loading={loading}
                fullWidth
                size="lg"
                disabled={!email || !password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>
            
            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
            {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
            
            <DemoSection theme={theme}>
              <DemoTitle theme={theme}>Demo Accounts</DemoTitle>
              <p style={{ 
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Try the application with these demo accounts:
              </p>
              
              <DemoGrid theme={theme}>
                <DemoCredential theme={theme}>
                  <DemoLabel theme={theme}>
                    <DemoRole theme={theme}>👑 Administrator</DemoRole>
                    <DemoEmail theme={theme}>admin@chaircare.co.za</DemoEmail>
                  </DemoLabel>
                  <DemoButton theme={theme} onClick={() => fillDemoCredentials('admin')}>
                    Use Admin
                  </DemoButton>
                </DemoCredential>
                
                <DemoCredential theme={theme}>
                  <DemoLabel theme={theme}>
                    <DemoRole theme={theme}>🏢 Client</DemoRole>
                    <DemoEmail theme={theme}>client@company.co.za</DemoEmail>
                  </DemoLabel>
                  <DemoButton theme={theme} onClick={() => fillDemoCredentials('client')}>
                    Use Client
                  </DemoButton>
                </DemoCredential>
                
                <DemoCredential theme={theme}>
                  <DemoLabel theme={theme}>
                    <DemoRole theme={theme}>🔧 Technician</DemoRole>
                    <DemoEmail theme={theme}>tech@chaircare.co.za</DemoEmail>
                  </DemoLabel>
                  <DemoButton theme={theme} onClick={() => fillDemoCredentials('technician')}>
                    Use Technician
                  </DemoButton>
                </DemoCredential>
              </DemoGrid>
              
              <AccessSection theme={theme}>
                <AccessText theme={theme}>
                  Need access to the system?
                </AccessText>
                <Button
                  variant="outline"
                  onClick={() => router.push('/request-access')}
                  fullWidth
                >
                  Request Access
                </Button>
              </AccessSection>
              
              <SecurityNote theme={theme}>
                <SecurityText theme={theme}>
                  🔒 Your data is protected with enterprise-grade security. 
                  All communications are encrypted and your privacy is our priority.
                </SecurityText>
              </SecurityNote>
            </DemoSection>
          </Card.Content>
        </LoginCard>
      </LoginContent>
      
      <Footer />
    </LoginContainer>
  );
};

export default LoginPage;