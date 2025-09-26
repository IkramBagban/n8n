import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Providers from "@/components/providers";
import ClientLayout from "@/components/client-layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "n8n - Workflow Automation",
  description: "Build powerful automation workflows",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
