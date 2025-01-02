import { getServerSession, NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      async profile(profile) {
        if (!profile?.email) throw new Error('Email is required');
        if (!profile?.name) throw new Error('Name is required');

        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (user) {
          if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { email: profile.email },
              data: { emailVerified: new Date() },
            });
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: profile.image,
          };
        }

        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            emailVerified: new Date()
          },
        });

        await prisma.organization.create({
          data: {
            name: profile.name,
            isDefault: true,
            userId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: profile.image,
        };
      },

    }),
    CredentialsProvider({
      id: 'credentials',
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error('Please enter an email and password');

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        }).catch(() => {
          throw new Error('Something went wrong');
        });

        if (!user || !user.hashedPassword) throw new Error('No user found');

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) throw new Error('Invalid password');

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // token.name = user.name;
        // token.email = user.email;
        // token.accessToken = user.accessToken;
        // token.refreshToken = user.refreshToken;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        // token.name = user.name;
        // token.email = user.email;
        // token.accessToken = user.accessToken;
        // token.refreshToken = user.refreshToken;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}