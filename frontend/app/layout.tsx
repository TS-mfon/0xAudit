import "../styles/globals.css";
import Link from "next/link";
import { CyberNav } from "../components/shared/CyberNav";

export const metadata = {
  title: "0xAudit",
  description: "Decentralized Smart Contract Auditing Infrastructure",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-[#00FF41] antialiased">
        <div className="cyber-bg min-h-screen pb-16 md:pb-0">
          <header className="sticky top-0 z-50 border-b border-[#00FF41]/60 bg-black/90 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
              <Link href="/" className="terminal-title text-lg">0xAudit://ROOT</Link>
              <div className="hidden items-center gap-5 text-xs font-bold text-[#00FF41]/70 md:flex">
                <Link href="/audit" className="hover:text-[#00FF41]">EXECUTE_AUDIT</Link>
                <Link href="/dashboard" className="hover:text-[#00FF41]">VIEW_ACTIVITY</Link>
              </div>
            </nav>
          </header>
          {children}
          <CyberNav />
        </div>
      </body>
    </html>
  );
}
