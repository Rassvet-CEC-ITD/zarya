import ZaryaAbi from '~/assets/abis/Zarya.json'

// Zarya contract deployed on Sepolia testnet (chain ID: 11155111)
export const ZARYA_CONTRACT_ADDRESS = '0xa009532cabaa4d3064a1a786a913a1949f1c37d6' as const

export const ZARYA_CONTRACT_CONFIG = {
  address: ZARYA_CONTRACT_ADDRESS,
  abi: ZaryaAbi.abi
} as const
