import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, sepolia, hardhat } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
// AppKitWrapper.jsx

// Create AppKit configuration
const projectId = 'b733907b13ef59931a5ab9c55db6f28c';
const metadata = {
  name: 'Jaidad',
  description: 'Let us find a Jaidad for you',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/']
};


// 0. Setup queryClient
const queryClient = new QueryClient()


// 3. Set the networks
const networks = [mainnet, arbitrum, sepolia, hardhat]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})


export function AppKitWrapper({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}