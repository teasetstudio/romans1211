import * as React from 'react';

interface ResetPasswordEmailTemplateProps {
  name: string;
  resetUrl: string;
}

export const ResetPasswordEmailTemplate: React.FC<ResetPasswordEmailTemplateProps> = ({
  name,
  resetUrl,
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
        Reset Your Password
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#4A5568',
        lineHeight: '1.6',
        marginBottom: '5px',
      }}>
        &quot;Be strong and courageous. Do not be afraid...&quot;
      </p>
      <p style={{
        fontSize: '14px',
        color: '#718096',
        fontStyle: 'italic',
        marginTop: '0',
      }}>
        - Joshua 1:9
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
        Hello {name}, we received a request to reset your password. Click the button below to choose a new password:
      </p>

      <div style={{
        textAlign: 'center',
        margin: '30px 0',
      }}>
        <a
          href={resetUrl}
          style={{
            backgroundColor: '#4299E1',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          Reset Password
        </a>
      </div>

      <p style={{
        color: '#718096',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        If you can&apos;t click the button, you can also copy and paste this URL into your browser: {' '}
        <a
          href={resetUrl}
          style={{
            color: '#4299E1',
            textDecoration: 'none',
            wordBreak: 'break-all',
          }}
        >
          {resetUrl}
        </a>
      </p>
    </div>

    <div style={{
      textAlign: 'center',
      color: '#718096',
      fontSize: '14px',
      marginTop: '20px',
    }}>
      <p>If you didn&apos;t request this, you can safely ignore this email.</p>
    </div>
  </div>
);
