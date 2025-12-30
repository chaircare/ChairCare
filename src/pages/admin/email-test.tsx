import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import apiClient from 'lib/api-client';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';

const TestContainer = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin: 0 0 ${theme.spacing['2xl']} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const InfoBox = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const InfoTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.lg};
`;

const InfoText = styled.p`
  margin: 0;
  color: ${theme.colors.primary[600]};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${({ type }) => type === 'success' ? `
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[700]};
    border: 1px solid ${theme.colors.success[200]};
  ` : `
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error[700]};
    border: 1px solid ${theme.colors.error[200]};
  `}
`;

const EmailTestPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (!user || user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/api/admin/test-email', {
        testEmail
      });

      if (response.data.success) {
        setMessage('✅ Test email sent successfully! Check your inbox.');
        setMessageType('success');
      } else {
        setMessage(`❌ ${response.data.error}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.error || 'Failed to send test email'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <TestContainer>
        <Title>📧 Email Configuration Test</Title>
        
        <InfoBox>
          <InfoTitle>🔧 Email Setup Status</InfoTitle>
          <InfoText>
            <strong>Email Service:</strong> {process.env.EMAIL_USERNAME ? '✅ Configured' : '❌ Not configured'}<br />
            <strong>Provider:</strong> {process.env.EMAIL_USERNAME?.includes('@gmail.com') ? 'Gmail' : 'Custom SMTP'}<br />
            <strong>Mode:</strong> {process.env.EMAIL_USERNAME ? 'Production (real emails)' : 'Development (console only)'}
          </InfoText>
        </InfoBox>

        {message && (
          <StatusMessage type={messageType}>
            {message}
          </StatusMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to send test message"
            required
            fullWidth
          />

          <Button 
            type="submit" 
            loading={loading}
            disabled={loading}
            size="lg"
            fullWidth
          >
            {loading ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>
        </Form>

        <InfoBox style={{ marginTop: theme.spacing.xl }}>
          <InfoTitle>📋 Setup Instructions</InfoTitle>
          <InfoText>
            <strong>For Gmail:</strong><br />
            1. Enable 2-Factor Authentication<br />
            2. Generate App Password in Google Account settings<br />
            3. Update EMAIL_PASSWORD in .env.local with the 16-character app password<br />
            4. Restart the development server<br /><br />
            
            <strong>Current Configuration:</strong><br />
            EMAIL_USERNAME: {process.env.EMAIL_USERNAME || 'Not set'}<br />
            EMAIL_PASSWORD: {process.env.EMAIL_PASSWORD ? '••••••••••••••••' : 'Not set'}
          </InfoText>
        </InfoBox>
      </TestContainer>
    </Layout>
  );
};

export default EmailTestPage;