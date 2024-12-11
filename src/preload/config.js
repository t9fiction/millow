import { createPublicClient } from 'viem'
import { arbitrum, hardhat, localhost, mainnet, sepolia } from 'viem/chains'
import { http, createConfig } from '@wagmi/core'

export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  })

  export const config2 = createConfig({
    chains: [mainnet, arbitrum, sepolia, localhost, hardhat],
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [sepolia.id]: http(),
      [localhost.id]: http(),
      [hardhat.id]: http(),
    },
  })