import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';

const CalendarPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== 'admin') {
    router.push('/dashboard');
    return null;
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