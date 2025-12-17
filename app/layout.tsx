import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ripple Custody MPT Demo",
  description: "Showcase MPT operations with Ripple Custody system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

