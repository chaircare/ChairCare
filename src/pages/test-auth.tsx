import React, { useState } from 'react';
import { NextPage } from 'next';
import apiClient from 'lib/api-client';

const TestAuthPage: NextPage = () => {
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@chaircare.co.za',
          password: 'password'
        })
      });
      
      const data = await response.json();
      setResult(`Login: ${JSON.stringify(data, null, 2)}`);
      
      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
      }
    } catch (error) {
      setResult(`Login Error: ${error}`);
    }
  };

  const testProtectedRoute = async () => {
    try {
      const response = await apiClient.get('/api/dashboard');
      setResult(`Dashboard: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`Dashboard Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testChairs = async () => {
    try {
      const response = await apiClient.get('/api/chairs');
      setResult(`Chairs: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`Chairs Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Authentication Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={testLogin} style={{ marginRight: '1rem' }}>
          Test Login
        </button>
        <button onClick={testProtectedRoute} style={{ marginRight: '1rem' }}>
          Test Dashboard
        </button>
        <button onClick={testChairs}>
          Test Chairs
        </button>
      </div>
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {result}
      </pre>
    </div>
  );
};

export default TestAuthPage;