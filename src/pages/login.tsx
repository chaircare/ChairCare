import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.md};
  }
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
  
  @media (max-width: 480px) {
    max-width: 100%;
    margin: 0 ${props => props.theme.spacing.sm};
  }
`;

const LogoSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing['2xl']};
  padding: ${props => props.theme.spacing.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

  return (
    <>
      <Head>
        <title>Sign In - Chair Care</title>
        <meta name="description" content="Sign in to your Chair Care account to manage your office chair maintenance and repair services" />
      </Head>
      <LoginContainer theme={theme}>
      <LoginContent theme={theme}>
        <ThemeToggleContainer theme={theme}>
          <ThemeToggle />
        </ThemeToggleContainer>
        
        <LoginCard theme={theme}>
          <Card.Content>
            <LogoSection theme={theme}>
              <Logo 
                variant={mode} 
                size="lg" 
                showText={true}
                customLogo="/images/lightmode.jpeg"
                customLogoAlt="Chair Care Logo"
              />
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
          </Card.Content>
        </LoginCard>
      </LoginContent>
      
      <Footer />
    </LoginContainer>
    </>
  );
};

export default LoginPage;