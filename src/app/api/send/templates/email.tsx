import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }}>
    <div style={{
      textAlign: 'center',
      marginBottom: '30px',
    }}>
      <h1 style={{
        color: '#2D3748',
        fontSize: '24px',
        marginBottom: '10px',
      }}>
        Welcome to OneLib, {firstName}!
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#4A5568',
        lineHeight: '1.6',
        marginBottom: '5px',
      }}>
        &quot;Let the word of Christ dwell in you richly...&quot;
      </p>
      <p style={{
        fontSize: '14px',
        color: '#718096',
        fontStyle: 'italic',
        marginTop: '0',
      }}>
        - Colossians 3:16
      </p>
    </div>

    <div style={{
      backgroundColor: '#F7FAFC',
      padding: '20px',
      borderRadius: '6px',
      marginBottom: '24px',
    }}>
      <p style={{
        color: '#4A5568',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '20px',
      }}>
        Thank you for joining our community of believers. We&apos;re excited to have you as part of OneLib!
      </p>
      <p style={{
        fontSize: '14px',
        color: '#718096',
        lineHeight: '1.6',
      }}>
        If you didn&apos;t request this email, you can safely ignore it.
      </p>
    </div>

    <div style={{
      textAlign: 'center',
      color: '#718096',
      fontSize: '14px',
      marginTop: '20px',
    }}>
      <p>May God bless your journey with OneLib!</p>
    </div>
  </div>
);
