/**
 * Supported chain identifiers
 */
export type ChainId =
  | 'ethereum'
  | 'stellar'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'base'
  | 'gnosis'
  | 'nova'
  | 'bsc'
  | 'avalanche';

/**
 * Bridge provider identifiers
 */
export type BridgeProvider = 'stellar' | 'layerzero' | 'hop';

/**
 * Unified bridge route response
 */
export interface BridgeRoute {
  /** Unique identifier for this route */
  id: string;
  /** Bridge provider name */
  provider: BridgeProvider;
  /** Source chain identifier */
  sourceChain: ChainId;
  /** Target chain identifier */
  targetChain: ChainId;
  /** Input amount (in smallest unit, e.g., wei) */
  inputAmount: string;
  /** Output amount after fees (in smallest unit) */
  outputAmount: string;
  /** Total fees charged (in smallest unit) */
  fee: string;
  /** Fee percentage (0-100) */
  feePercentage: number;
  /** Estimated time to complete bridge (in seconds) */
  estimatedTime: number;
  /** Minimum amount out (for slippage protection) */
  minAmountOut: string;
  /** Maximum amount out */
  maxAmountOut: string;
  /** Transaction deadline timestamp (Unix epoch in seconds) */
  deadline?: number;
  /** Bridge-specific transaction data */
  transactionData?: {
    /** Contract address to interact with */
    contractAddress?: string;
    /** Encoded calldata */
    calldata?: string;
    /** Value to send with transaction */
    value?: string;
    /** Gas estimate */
    gasEstimate?: string;
  };
  /** Additional metadata */
  metadata?: {
    /** Route description */
    description?: string;
    /** Risk level (1-5, 1 being safest) */
    riskLevel?: number;
    /** Bridge-specific data */
    [key: string]: unknown;
  };
}

/**
 * Request parameters for route discovery
 */
export interface RouteRequest {
  /** Source chain identifier */
  sourceChain: ChainId;
  /** Target chain identifier */
  targetChain: ChainId;
  /** Amount to bridge (in smallest unit, e.g., wei) */
  assetAmount: string;
  /** Optional: Token contract address on source chain */
  tokenAddress?: string;
  /** Optional: Slippage tolerance (0-100, default: 0.5) */
  slippageTolerance?: number;
  /** Optional: Recipient address */
  recipientAddress?: string;
}

/**
 * Aggregated routes response
 */
export interface AggregatedRoutes {
  /** Array of available routes, sorted by best option first */
  routes: BridgeRoute[];
  /** Timestamp when routes were fetched */
  timestamp: number;
  /** Total number of providers queried */
  providersQueried: number;
  /** Number of successful responses */
  providersResponded: number;
}

/**
 * Error response from a bridge provider
 */
export interface BridgeError {
  provider: BridgeProvider;
  error: string;
  code?: string;
}
