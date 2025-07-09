
import type { Metadata } from "next";
import {Geist, Geist_Mono, Poppins} from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventUp",
  description: "EventUp is a platform for creating and managing events.",
    icons:{
    icon: "/assets/icons/logo.png",
    }
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={`${poppins.variable} ${poppins.variable} antialiased`}>

          {children}

      </body>
      </html>
  );
}
