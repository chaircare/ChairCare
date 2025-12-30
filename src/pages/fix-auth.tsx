import React, { useState } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth } from 'lib/firebase';

const FixContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing.xl};
`;

const FixCard = styled(Card)`
  width: 100%;
  max-width: 600px;
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

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.lg} 0;
  background: ${props => 
    props.type === 'success' ? theme.colors.success[50] : 
    props.type === 'error' ? theme.colors.error[50] : 
    theme.colors.primary[50]
  };
  color: ${props => 
    props.type === 'success' ? theme.colors.success[700] : 
    props.type === 'error' ? theme.colors.error[700] : 
    theme.colors.primary[700]
  };
  border: 1px solid ${props => 
    props.type === 'success' ? theme.colors.success[200] : 
    props.type === 'error' ? theme.colors.error[200] : 
    theme.colors.primary[200]
  };
`;

const InstructionsList = styled.ol`
  text-align: left;
  margin: ${theme.spacing.lg} 0;
  padding-left: ${theme.spacing.lg};
  
  li {
    margin: ${theme.spacing.sm} 0;
    color: ${theme.colors.text.secondary};
  }
`;

const FixAuth: NextPage = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setMessage({ type: 'info', text: 'Attempting to fix authentication issues...' });

    try {
      // Try to sign in with common passwords to identify the issue
      const testCredentials = [
        { email: 'admin@chaircare.co.za', password: 'ChairCare2024!' },
        { email: 'admin@chaircare.co.za', password: 'password' },
        { email: 'admin@chaircare.co.za', password: 'admin123' },
        { email: 'client@company.co.za', password: 'ClientDemo2024!' },
        { email: 'client@company.co.za', password: 'password' }
      ];

      let foundWorking = false;
      const workingCredentials = [];

      for (const cred of testCredentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cred.email, cred.password);
          workingCredentials.push(`${cred.email} / ${cred.password}`);
          await auth.signOut(); // Sign out immediately
          foundWorking = true;
        } catch (error) {
          // Continue to next credential
        }
      }

      if (foundWorking) {
        setMessage({ 
          type: 'success', 
          text: `✅ Found working credentials:\n${workingCredentials.join('\n')}\n\nYou can now use these to log in!` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌ No working credentials found. You need to manually delete Firebase Auth users and run setup again.' 
        });
      }

    } catch (error) {
      console.error('Fix error:', error);
      setMessage({ type: 'error', text: 'Failed to fix authentication. Check console for details.' });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <FixContainer>
      <FixCard>
        <Title>🔧 Fix Authentication Issues</Title>
        <Description>
          This tool will try to identify working credentials for existing Firebase accounts.
        </Description>
        
        {message && (
          <StatusMessage type={message.type}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.text}</pre>
          </StatusMessage>
        )}

        <Button
          onClick={handleFix}
          disabled={isFixing}
          variant="primary"
          size="lg"
        >
          {isFixing ? 'Checking Credentials...' : 'Find Working Credentials'}
        </Button>

        <Description style={{ marginTop: theme.spacing.xl, fontSize: '0.9rem' }}>
          <strong>Manual Fix Instructions:</strong>
        </Description>
        
        <InstructionsList>
          <li>Go to <strong>Firebase Console</strong>: https://console.firebase.google.com</li>
          <li>Select project: <strong>chairecaredemo</strong></li>
          <li>Go to <strong>Authentication → Users</strong></li>
          <li>Delete all existing users</li>
          <li>Go to <strong>/setup</strong> to create fresh accounts</li>
        </InstructionsList>
      </FixCard>
    </FixContainer>
  );
};

export default FixAuth;