import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { DomainProvider } from "./contexts/DomainContext";
import { AppShell } from "./components/layout/AppShell";
import { getLedgerConfig } from "./_actions/ledgers";

export const metadata: Metadata = {
  title: "Ripple Custody",
  description: "Ripple Custody Operations Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ledgerConfig = await getLedgerConfig();

  return (
    <html lang="en">
      <body>
        <QueryProvider ledgerConfig={ledgerConfig}>
          <DomainProvider>
            <AppShell>{children}</AppShell>
          </DomainProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
