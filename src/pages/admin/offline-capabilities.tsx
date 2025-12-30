import React from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { OfflineCapabilities } from 'components/OfflineCapabilities';
import { theme } from 'styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Description = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
  line-height: 1.6;
`;

const OfflineCapabilitiesPage: NextPage = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Admin only.</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Offline Capabilities</Title>
          <Description>
            Monitor and manage offline data synchronization for technicians working in the field.
            Configure sync settings, view pending data, and resolve conflicts.
          </Description>
        </Header>

        <OfflineCapabilities />
      </Container>
    </Layout>
  );
};

export default OfflineCapabilitiesPage;