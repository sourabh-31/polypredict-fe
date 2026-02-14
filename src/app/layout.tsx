import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Provider from "@/lib/Provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolyPredict",
  description:
    "A simplified prediction market dashboard built with Next.js and TypeScript. Users can simulate trades, track positions, and monitor live market prices from Polymarket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
