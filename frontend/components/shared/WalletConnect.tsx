"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button className="rounded border border-strong/40 bg-strong/10 px-4 py-2 font-mono text-sm text-strong" onClick={() => disconnect()}>
        Disconnect {address?.slice(0, 6)}...
      </button>
    );
  }

  return (
    <button className="rounded border border-strong/50 bg-strong px-4 py-2 font-mono text-sm font-bold text-obsidian" onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
