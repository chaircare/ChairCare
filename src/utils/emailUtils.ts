/**
 * Client-side utility functions for sending emails via API routes
 */

interface EmailRequest {
  type: 'welcome' | 'password-reset';
  email: string;
  name: string;
  password: string;
  role?: string;
}

/**
 * Send an email via the API route
 */
export const sendEmail = async (emailData: EmailRequest): Promise<boolean> => {
  try {
    const response = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send welcome email for new users
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string,
  role: string = 'Client'
): Promise<boolean> => {
  return sendEmail({
    type: 'welcome',
    email,
    name,
    password,
    role
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  password: string
): Promise<boolean> => {
  return sendEmail({
    type: 'password-reset',
    email,
    name,
    password
  });
};