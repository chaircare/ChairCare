import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';

const CalendarPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Don't redirect during SSR
  if (typeof window !== 'undefined' && (!user || user.role !== 'admin')) {
    router.push('/dashboard');
    return null;
  }

  // Show loading or access denied during SSR
  if (!user) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (user.role !== 'admin') {
    return (
      <Layout>
        <div>Access denied. Admin access required.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1>Job Schedule Calendar</h1>
        <p>This page is under construction.</p>
      </div>
    </Layout>
  );
};

export default CalendarPage;