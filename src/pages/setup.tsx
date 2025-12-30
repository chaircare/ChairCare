import React, { useState } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from 'lib/firebase';
import { initializeServicePricing } from 'lib/firebase-database';
import { UserProfile } from 'lib/firebase-auth';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';

const SetupContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing.xl};
`;

const SetupCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const LogoSection = styled.div`
  margin-bottom: ${theme.spacing['2xl']};
`;

const LogoIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%);
  border-radius: ${theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.inverse};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize['2xl']};
  margin: 0 auto ${theme.spacing.md};
  box-shadow: ${theme.shadows.lg};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const SetupSteps = styled.div`
  text-align: left;
  margin: ${theme.spacing['2xl']} 0;
`;

const StepItem = styled.div<{ completed?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  background: ${({ completed }) => completed ? theme.colors.success[50] : theme.colors.gray[50]};
  border: 1px solid ${({ completed }) => completed ? theme.colors.success[200] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIcon = styled.div<{ completed?: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${({ completed }) => completed ? theme.colors.success[500] : theme.colors.gray[300]};
  color: ${theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
`;

const StepDescription = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const AlertMessage = styled.div<{ type: 'error' | 'success' | 'info' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${({ type }) => {
    switch (type) {
      case 'error':
        return `
          background: ${theme.colors.error[50]};
          color: ${theme.colors.error[700]};
          border: 1px solid ${theme.colors.error[200]};
        `;
      case 'success':
        return `
          background: ${theme.colors.success[50]};
          color: ${theme.colors.success[700]};
          border: 1px solid ${theme.colors.success[200]};
        `;
      default:
        return `
          background: ${theme.colors.primary[50]};
          color: ${theme.colors.primary[700]};
          border: 1px solid ${theme.colors.primary[200]};
        `;
    }
  }}
`;

const CredentialsBox = styled.div`
  background: ${theme.colors.gray[900]};
  color: ${theme.colors.gray[100]};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.typography.fontFamily.mono.join(', ')};
  font-size: ${theme.typography.fontSize.sm};
  margin: ${theme.spacing.lg} 0;
  text-align: left;
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    color: ${theme.colors.gray[100]};
  }
  
  p {
    margin: ${theme.spacing.sm} 0;
  }
`;

const SetupPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{ email: string; password: string } | null>(null);

  const runSetup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Create admin user
      const adminEmail = 'admin@chaircare.co.za';
      const adminPassword = 'ChairCare2024!';
      
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      // Step 2: Create admin profile
      const adminProfile: UserProfile = {
        id: userCredential.user.uid,
        email: adminEmail,
        name: 'Chair Care Admin',
        role: 'admin',
        status: 'approved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), adminProfile);
      
      // Step 3: Initialize service pricing
      await initializeServicePricing();
      
      // Step 4: Create sample client for demo
      const clientEmail = 'client@company.co.za';
      const clientPassword = 'ClientDemo2024!';
      
      const clientCredential = await createUserWithEmailAndPassword(auth, clientEmail, clientPassword);
      
      const clientProfile: UserProfile = {
        id: clientCredential.user.uid,
        email: clientEmail,
        name: 'John Smith',
        role: 'client',
        companyName: 'ABC Corporation',
        status: 'approved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', clientCredential.user.uid), clientProfile);
      
      setAdminCredentials({ email: adminEmail, password: adminPassword });
      setSetupComplete(true);
      setSuccess('Firebase setup completed successfully!');
      
    } catch (err: any) {
      console.error('Setup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Setup already completed. The admin account already exists.');
        setSetupComplete(true);
        setAdminCredentials({ email: 'admin@chaircare.co.za', password: 'ChairCare2024!' });
      } else {
        setError(`Setup failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SetupContainer>
      <SetupCard shadow="lg">
        <LogoSection>
          <LogoIcon>🔧</LogoIcon>
          <Title>Firebase Setup</Title>
          <Subtitle>
            Initialize your Chair Care application with Firebase
          </Subtitle>
        </LogoSection>

        <AlertMessage type="info">
          <strong>First Time Setup Required</strong><br />
          This will create the admin account, initialize the database, and set up default configurations.
        </AlertMessage>

        <SetupSteps>
          <StepItem completed={setupComplete}>
            <StepIcon completed={setupComplete}>
              {setupComplete ? '✓' : '1'}
            </StepIcon>
            <StepContent>
              <StepTitle>Create Admin Account</StepTitle>
              <StepDescription>
                Set up the default administrator account for managing the system
              </StepDescription>
            </StepContent>
          </StepItem>

          <StepItem completed={setupComplete}>
            <StepIcon completed={setupComplete}>
              {setupComplete ? '✓' : '2'}
            </StepIcon>
            <StepContent>
              <StepTitle>Initialize Database</StepTitle>
              <StepDescription>
                Create default service pricing and system configurations
              </StepDescription>
            </StepContent>
          </StepItem>

          <StepItem completed={setupComplete}>
            <StepIcon completed={setupComplete}>
              {setupComplete ? '✓' : '3'}
            </StepIcon>
            <StepContent>
              <StepTitle>Create Demo Client</StepTitle>
              <StepDescription>
                Set up a sample client account for testing the system
              </StepDescription>
            </StepContent>
          </StepItem>
        </SetupSteps>

        {error && <AlertMessage type="error">{error}</AlertMessage>}
        {success && <AlertMessage type="success">{success}</AlertMessage>}

        {!setupComplete && (
          <Button 
            onClick={runSetup}
            loading={loading}
            fullWidth
            size="lg"
          >
            {loading ? 'Setting up Firebase...' : 'Run Setup'}
          </Button>
        )}

        {setupComplete && adminCredentials && (
          <>
            <CredentialsBox>
              <h4>🔑 Admin Login Credentials</h4>
              <p><strong>Email:</strong> {adminCredentials.email}</p>
              <p><strong>Password:</strong> {adminCredentials.password}</p>
              <br />
              <h4>👤 Demo Client Credentials</h4>
              <p><strong>Email:</strong> client@company.co.za</p>
              <p><strong>Password:</strong> ClientDemo2024!</p>
            </CredentialsBox>

            <Button 
              onClick={() => window.location.href = '/login'}
              fullWidth
              size="lg"
              variant="success"
            >
              Go to Login Page
            </Button>
          </>
        )}
      </SetupCard>
    </SetupContainer>
  );
};

export default SetupPage;