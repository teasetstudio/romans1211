import { ResetPasswordEmailTemplate } from '@/app/api/send/templates/reset-password-email';
import { defaultResendEmail } from '@/res/consts';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface IEmailProps {
  toEmails: string[];
  subject: string;
}

interface IReactEmailProps extends IEmailProps {
  react: React.ReactNode;
  html?: never;
}
interface IHtmlEmailProps extends IEmailProps {
  react?: never;
  html: string;
}

export function sendEmail({
  toEmails,
  subject,
  react,
  html,
}: IReactEmailProps | IHtmlEmailProps) {
  return resend.emails.send({
    from: defaultResendEmail,
    to: toEmails,
    subject,
    react,
    html,
  });
}

export function sendResetPasswordEmail({ name, email, resetUrl }: { name: string, email: string, resetUrl: string }) {
  return resend.emails.send({
    from: defaultResendEmail,
    to: [email],
    subject: 'Reset your password',
    react: ResetPasswordEmailTemplate({ name, resetUrl }),
  });
}