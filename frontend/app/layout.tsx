import "../styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "0xAudit",
  description: "Decentralized Smart Contract Auditing Infrastructure",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-obsidian text-foreground antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-panel-border bg-obsidian/90 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-mono text-lg font-bold text-strong">0xAudit</Link>
              <div className="hidden items-center gap-5 text-sm text-foreground-muted md:flex">
                <Link href="/audit" className="hover:text-foreground">Audit</Link>
                <Link href="/dashboard" className="hover:text-foreground">Activity</Link>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
