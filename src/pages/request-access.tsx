import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useTheme, ThemeToggle } from 'contexts/ThemeContext';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';
import { Logo } from 'components/ui/Logo';
import { Footer } from 'components/ui/Footer';

const RequestContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(3, 105, 161, 0.05) 50%, rgba(248, 250, 252, 1) 100%)'
  };
`;

const RequestContent = styled.div<{ theme: any }>`
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

const RequestCard = styled(Card)<{ theme: any }>`
  width: 100%;
  max-width: 500px;
  text-align: center;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };
  backdrop-filter: blur(8px);
`;

const LogoSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing['2xl']};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Title = styled.h1<{ theme: any }>`
  margin: ${props => props.theme.spacing.lg} 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const Form = styled.form<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  text-align: left;
`;

const Select = styled.select<{ theme: any }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const TextArea = styled.textarea<{ theme: any }>`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const Label = styled.label<{ theme: any }>`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SuccessMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.success[600]};
  background: ${props => props.theme.colors.success[50]};
  border: 1px solid ${props => props.theme.colors.success[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.error[600]};
  background: ${props => props.theme.colors.error[50]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const BackToLogin = styled.div<{ theme: any }>`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const BackText = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const RequestAccessPage: NextPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { theme, mode } = useTheme();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, you would send this data to your backend
      console.log('Access request submitted:', formData);
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        reason: ''
      });
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.company && formData.role && formData.reason;

  return (
    <RequestContainer theme={theme}>
      <RequestContent theme={theme}>
        <ThemeToggleContainer theme={theme}>
          <ThemeToggle />
        </ThemeToggleContainer>
        
        <RequestCard theme={theme}>
          <Card.Content>
            <LogoSection theme={theme}>
              <Logo variant={mode} size="lg" showText={true} />
              <Title theme={theme}>Request System Access</Title>
              <Subtitle theme={theme}>
                Fill out the form below to request access to the Chair Care management system. 
                Our team will review your request and get back to you within 24 hours.
              </Subtitle>
            </LogoSection>

            {success ? (
              <SuccessMessage theme={theme}>
                🎉 Your access request has been submitted successfully! 
                <br /><br />
                Our team will review your request and contact you within 24 hours. 
                Please check your email for updates.
              </SuccessMessage>
            ) : (
              <Form theme={theme} onSubmit={handleSubmit}>
                <div>
                  <Label theme={theme} htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    fullWidth
                    required
                  />
                </div>

                <div>
                  <Label theme={theme} htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    fullWidth
                    required
                  />
                </div>

                <div>
                  <Label theme={theme} htmlFor="company">Company/Organization *</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company or organization name"
                    fullWidth
                    required
                  />
                </div>

                <div>
                  <Label theme={theme} htmlFor="role">Requested Role *</Label>
                  <Select
                    theme={theme}
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="client">Client - Manage my company's chairs</option>
                    <option value="technician">Technician - Perform chair services</option>
                    <option value="admin">Administrator - Full system access</option>
                  </Select>
                </div>

                <div>
                  <Label theme={theme} htmlFor="reason">Reason for Access *</Label>
                  <TextArea
                    theme={theme}
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please explain why you need access to the Chair Care system and how you plan to use it..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  loading={loading}
                  fullWidth
                  size="lg"
                  disabled={!isFormValid}
                >
                  {loading ? 'Submitting Request...' : 'Submit Access Request'}
                </Button>
              </Form>
            )}
            
            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
            
            <BackToLogin theme={theme}>
              <BackText theme={theme}>
                Already have an account?
              </BackText>
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                fullWidth
              >
                Back to Login
              </Button>
            </BackToLogin>
          </Card.Content>
        </RequestCard>
      </RequestContent>
      
      <Footer />
    </RequestContainer>
  );
};

export default RequestAccessPage;