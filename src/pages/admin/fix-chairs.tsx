import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FixCard = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const Description = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const ResultsCard = styled(Card)<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.xl};
  text-align: left;
`;

const ResultSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ResultTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ResultList = styled.ul<{ theme: any }>`
  margin: 0;
  padding-left: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const ResultItem = styled.li<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.sm};
  font-family: 'JetBrains Mono', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.error[50]};
  color: ${props => props.theme.colors.error[700]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const SuccessMessage = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.success[50]};
  color: ${props => props.theme.colors.success[700]};
  border: 1px solid ${props => props.theme.colors.success[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const FixChairsPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleFixChairs = async () => {
    // Check if user is admin on client side
    if (user?.role !== 'admin') {
      setError('Only administrators can run this fix utility.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/admin/fix-chair-qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Failed to fix chair QR codes');
      }
    } catch (err: any) {
      console.error('Fix chairs error:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/dashboard')}>
      <Container>
        <FixCard theme={theme}>
          <Card.Content>
            <Title theme={theme}>Fix Chair QR Codes</Title>
            <Description theme={theme}>
              This utility will scan all chairs in the database and generate QR codes for any chairs that don't have them.
              This is useful for fixing chairs that were created before the QR code system was implemented.
            </Description>
            
            <Button
              onClick={handleFixChairs}
              loading={loading}
              size="lg"
              variant="primary"
            >
              {loading ? 'Fixing Chairs...' : 'Fix All Chair QR Codes'}
            </Button>
          </Card.Content>
        </FixCard>

        {error && (
          <ErrorMessage theme={theme}>
            <strong>Error:</strong> {error}
          </ErrorMessage>
        )}

        {results && (
          <>
            <SuccessMessage theme={theme}>
              <strong>Success!</strong> {results.message}
            </SuccessMessage>
            
            <ResultsCard theme={theme}>
              <Card.Header>
                <Card.Title>Fix Results</Card.Title>
              </Card.Header>
              <Card.Content>
                <ResultSection theme={theme}>
                  <ResultTitle theme={theme}>
                    📊 Summary
                  </ResultTitle>
                  <ResultList theme={theme}>
                    <ResultItem theme={theme}>Total chairs: {results.totalChairs}</ResultItem>
                    <ResultItem theme={theme}>Fixed chairs: {results.fixedChairs}</ResultItem>
                    <ResultItem theme={theme}>Already had QR codes: {results.alreadyHaveQR}</ResultItem>
                    <ResultItem theme={theme}>Errors: {results.errors}</ResultItem>
                  </ResultList>
                </ResultSection>

                {results.details.fixed.length > 0 && (
                  <ResultSection theme={theme}>
                    <ResultTitle theme={theme}>
                      ✅ Fixed Chairs ({results.details.fixed.length})
                    </ResultTitle>
                    <ResultList theme={theme}>
                      {results.details.fixed.map((chair: any, index: number) => (
                        <ResultItem key={index} theme={theme}>
                          {chair.chairNumber} ({chair.location}) → {chair.qrCode}
                        </ResultItem>
                      ))}
                    </ResultList>
                  </ResultSection>
                )}

                {results.details.alreadyHaveQR.length > 0 && (
                  <ResultSection theme={theme}>
                    <ResultTitle theme={theme}>
                      ✓ Already Had QR Codes ({results.details.alreadyHaveQR.length})
                    </ResultTitle>
                    <ResultList theme={theme}>
                      {results.details.alreadyHaveQR.slice(0, 10).map((chair: any, index: number) => (
                        <ResultItem key={index} theme={theme}>
                          {chair.chairNumber} → {chair.qrCode}
                        </ResultItem>
                      ))}
                      {results.details.alreadyHaveQR.length > 10 && (
                        <ResultItem theme={theme}>
                          ... and {results.details.alreadyHaveQR.length - 10} more
                        </ResultItem>
                      )}
                    </ResultList>
                  </ResultSection>
                )}

                {results.details.errors.length > 0 && (
                  <ResultSection theme={theme}>
                    <ResultTitle theme={theme}>
                      ❌ Errors ({results.details.errors.length})
                    </ResultTitle>
                    <ResultList theme={theme}>
                      {results.details.errors.map((error: any, index: number) => (
                        <ResultItem key={index} theme={theme}>
                          {error.chairNumber} ({error.chairId}): {error.error}
                        </ResultItem>
                      ))}
                    </ResultList>
                  </ResultSection>
                )}
              </Card.Content>
            </ResultsCard>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default FixChairsPage;