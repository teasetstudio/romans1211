import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  verificationUrl: string;
}

export const VerificationEmailTemplate: React.FC<EmailTemplateProps> = ({
  name,
  verificationUrl,
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
        Welcome to Christian Material Library, {name}!
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
        Thank you for joining our community of believers. To begin your journey with Christian Material Library, please verify your email address by clicking the button below:
      </p>

      <div style={{
        textAlign: 'center',
        margin: '30px 0',
      }}>
        <a
          href={verificationUrl}
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
          Verify Email Address
        </a>
      </div>

      <p style={{
        color: '#718096',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        If you can&apos;t click the button, you can also copy and paste this URL into your browser:{' '}
        <a
          href={verificationUrl}
          style={{
            color: '#4299E1',
            textDecoration: 'none',
            wordBreak: 'break-all',
          }}
        >
          {verificationUrl}
        </a>
      </p>
    </div>

    <div style={{
      borderTop: '1px solid #E2E8F0',
      paddingTop: '20px',
      marginTop: '20px',
    }}>
      <p style={{
        color: '#718096',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0',
      }}>
        If you did not create an account with Christian Material Library, please disregard this email.
      </p>
    </div>

    <div style={{
      textAlign: 'center',
      marginTop: '30px',
      color: '#A0AEC0',
      fontSize: '12px',
    }}>
      <p>Ephesians 4:12 - Your Digital Christian Library</p>
      <p> {new Date().getFullYear()} Ephesians 4:12. All rights reserved.</p>
    </div>
  </div>
);
