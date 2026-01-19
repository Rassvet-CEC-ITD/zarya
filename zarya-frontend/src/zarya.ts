import ZaryaAbi from './assets/abis/Zarya.json'

// Zarya contract deployed on Sepolia testnet (chain ID: 11155111)
export const ZARYA_CONTRACT_ADDRESS = '0xa009532cabaa4d3064a1a786a913a1949f1c37d6' as const

// Average blocks per day on Sepolia (12 second block time)
export const BLOCKS_PER_DAY = 7200n

export const DAYS_TO_SCAN: number = 1; //9 / Number(BLOCKS_PER_DAY);

// Zarya API base URL for backend services
export const ZARYA_API_BASE_URL = 'http://localhost:8080'

export const ZARYA_CONTRACT_CONFIG = {
  address: ZARYA_CONTRACT_ADDRESS,
  abi: ZaryaAbi.abi
} as const
