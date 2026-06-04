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
      <button className="ghost-button text-sm" onClick={() => disconnect()}>
        DISCONNECT {address?.slice(0, 6)}...
      </button>
    );
  }

  return (
    <button className="glitch-button text-sm" data-text="CONNECT_WALLET" onClick={() => connect({ connector: connectors[0] })}>
      CONNECT_WALLET
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
