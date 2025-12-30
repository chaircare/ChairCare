import React, { useState } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import axios from 'axios';

const ResetContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing.xl};
`;

const ResetCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const Description = styled.p`
  margin: 0 0 ${theme.spacing.xl} 0;
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.lg} 0;
  background: ${props => props.type === 'success' ? theme.colors.success[50] : theme.colors.error[50]};
  color: ${props => props.type === 'success' ? theme.colors.success[700] : theme.colors.error[700]};
  border: 1px solid ${props => props.type === 'success' ? theme.colors.success[200] : theme.colors.error[200]};
`;

const ResetFirebase: NextPage = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/admin/reset-firebase');
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Firebase reset successful! ${response.data.message}. You can now go to /setup to initialize fresh accounts.` 
        });
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Reset failed' });
      }
    } catch (error) {
      console.error('Reset error:', error);
      setMessage({ type: 'error', text: 'Failed to reset Firebase. Check console for details.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ResetContainer>
      <ResetCard>
        <Title>🔄 Reset Firebase Database</Title>
        <Description>
          This will clear all users and chairs from the Firebase database. 
          Use this if you're experiencing authentication issues or want to start fresh.
        </Description>
        
        {message && (
          <StatusMessage type={message.type}>
            {message.text}
          </StatusMessage>
        )}

        <Button
          onClick={handleReset}
          disabled={isResetting}
          variant="primary"
          size="lg"
        >
          {isResetting ? 'Resetting...' : 'Reset Firebase Database'}
        </Button>

        <Description style={{ marginTop: theme.spacing.lg, fontSize: '0.9rem' }}>
          After resetting, go to <strong>/setup</strong> to create fresh admin and demo accounts.
        </Description>
      </ResetCard>
    </ResetContainer>
  );
};

export default ResetFirebase;