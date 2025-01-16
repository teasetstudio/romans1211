import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from "react";

import "@/styles/globals.css";
import { getSession } from "@/lib/auth";
import { ClientSessionProvider } from "@/components/contexts/ClientSessionProvider";
import { ProgressProvider } from "@/components/contexts/ProgressProvider";

export const metadata: Metadata = {
  title: "Christian Material Library",
  description: "A comprehensive digital library and catalog for Christian ministry resources. Browse and manage sermons, worship songs, and interactive games for youth meetings, Sunday school, and summer camps.",
  keywords: "Christian library, ministry material catalog, sermon library, worship songs collection, youth ministry games, Sunday school resources, summer camp activities, church digital library, ministry resources, Christian education",
  openGraph: {
    title: "Christian Material Library",
    description: "A comprehensive digital library and catalog for Christian ministry resources. Browse and manage sermons, worship songs, and interactive games for youth meetings, Sunday school, and summer camps.",
    type: "website",
    locale: "en_US",
    siteName: "Ephesians 4:12",
    // images: [
    //   {
    //     url: "/images/onelib-og.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Christian Material Library"
    //   }
    // ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Material Library",
    description: "Access our digital library of sermons, worship songs, and youth ministry games. The perfect catalog for churches, youth groups, and summer camps.",
    creator: "@ephesians412",
    // images: ["/images/onelib-og.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" }
    ],
  },
  category: "Christian Library Software",
  applicationName: "Ephesians 4:12",
  // verification: {
  //   google: "your-google-site-verification",
  //   other: {
  //     me: ["@onelib-social-handle"]
  //   }
  // }
};

interface IProps {
  children: ReactNode
}

export default async function RootLayout({ children }: IProps) {
  const [locale, messages, session] = await Promise.all([
    getLocale(),
    getMessages(),
    getSession(),
  ]);

  return (
    <html lang={locale}>
      <body>
        <ClientSessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <ProgressProvider>{children}</ProgressProvider >
          </NextIntlClientProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
