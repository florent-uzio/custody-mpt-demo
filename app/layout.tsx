import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { DomainProvider } from "./contexts/DomainContext";

export const metadata: Metadata = {
  title: "Ripple Custody",
  description: "Ripple Custody Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <DomainProvider>{children}</DomainProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
