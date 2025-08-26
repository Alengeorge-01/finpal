import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/auth-provider';
import GoogleAnalytics from "@/components/google-analytics"; // Import the component

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FinPal",
  description: "Your modern personal finance dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning={true}>
        <GoogleAnalytics />
        <AuthProvider>
          {/* The global animated background */}
          <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 animate-[move-bg_20s_linear_infinite]"
          >
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/30 opacity-50 blur-[100px]"></div>
            <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-brand-primary/20 opacity-70 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-2xl bg-brand-primary/20 opacity-80 blur-2xl"></div>
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}