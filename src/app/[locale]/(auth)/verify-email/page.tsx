import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { AsyncParams } from '@/types/Params';
import { ROUTE_LOGIN } from '@/res/routes';

// Generate static pages for default locale (en) and ru locale
export function generateStaticParams() {
  return [
    // This will generate / and /en (they are the same)
    { locale: 'en' },
    // This will generate /ru
    { locale: 'ru' },
  ];
}

type IProps = AsyncParams<{}, { token: string }>

export default async function VerifyEmail({ searchParams }: IProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/');
  }

  let status: 'success' | 'error' = 'error';
  let message = '';

  try {
    // Find user with the verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      message = 'Invalid verification token';
    } else {
      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationToken: null,
        },
      });
      status = 'success';
      message = 'Email verified successfully!';
    }
  } catch (error) {
    console.error('Email verification error:', error);
    message = 'An error occurred during verification';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'success' ? (
              <div className="space-y-4">
                <div className="text-green-600">{message}</div>
                <Link
                  href={ROUTE_LOGIN}
                  className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-red-600">{message}</div>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Return to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
