import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rethink',
});

export const metadata: Metadata = {
  title: "Thinkn",
  description: "Enterprise technology platforms for governments and enterprises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={rethinkSans.variable}>
      <body className="font-sans bg-black text-white">{children}</body>
    </html>
  );
}
