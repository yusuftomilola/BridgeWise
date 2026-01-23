import axios, { AxiosInstance } from 'axios';
import { BaseBridgeAdapter } from './base';
import { BridgeRoute, RouteRequest, BridgeProvider, ChainId } from '../types';

/**
 * Stellar/Soroban bridge adapter
 * Handles bridging between Stellar network and other chains via Soroban smart contracts
 */
export class StellarAdapter extends BaseBridgeAdapter {
  readonly provider: BridgeProvider = 'stellar';
  private readonly rpcClient: AxiosInstance;
  private readonly horizonClient: AxiosInstance;
  
  // Stellar network configuration
  private readonly network: 'mainnet' | 'testnet';
  
  constructor(
    rpcUrl: string = 'https://soroban-rpc.mainnet.stellar.org',
    horizonUrl: string = 'https://horizon.stellar.org',
    network: 'mainnet' | 'testnet' = 'mainnet'
  ) {
    super();
    this.network = network;
    
    this.rpcClient = axios.create({
      baseURL: rpcUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.horizonClient = axios.create({
      baseURL: horizonUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  getName(): string {
    return 'Stellar/Soroban';
  }
  
  supportsChainPair(sourceChain: string, targetChain: string): boolean {
    // Stellar adapter supports:
    // - Stellar <-> Ethereum
    // - Stellar <-> Polygon
    // - Stellar <-> Arbitrum
    // - Stellar <-> Optimism
    // - Stellar <-> Base
    const supportedChains: ChainId[] = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'];
    
    const isStellarSource = sourceChain === 'stellar';
    const isStellarTarget = targetChain === 'stellar';
    const isSupportedSource = supportedChains.includes(sourceChain as ChainId);
    const isSupportedTarget = supportedChains.includes(targetChain as ChainId);
    
    return (isStellarSource && isSupportedTarget) || (isSupportedSource && isStellarTarget);
  }
  
  async fetchRoutes(request: RouteRequest): Promise<BridgeRoute[]> {
    if (!this.supportsChainPair(request.sourceChain, request.targetChain)) {
      return [];
    }
    
    try {
      const isFromStellar = request.sourceChain === 'stellar';
      
      if (isFromStellar) {
        return await this.fetchRoutesFromStellar(request);
      } else {
        return await this.fetchRoutesToStellar(request);
      }
    } catch (error) {
      console.error(`[StellarAdapter] Error fetching routes:`, error);
      return [];
    }
  }
  
  /**
   * Fetch routes when bridging FROM Stellar TO another chain
   */
  private async fetchRoutesFromStellar(request: RouteRequest): Promise<BridgeRoute[]> {
    try {
      // Query Soroban bridge contract for quote
      // In a real implementation, this would call the bridge contract's quote function
      const bridgeContractAddress = await this.getBridgeContractAddress(request.targetChain);
      
      if (!bridgeContractAddress) {
        return [];
      }
      
      // Estimate fees and output amount
      // Stellar bridges typically have very low fees
      const inputAmount = BigInt(request.assetAmount);
      
      // Stellar fees are typically very low (~0.00001 XLM per operation)
      // For cross-chain bridges, estimate ~0.1% fee
      const fee = inputAmount / 1000n;
      const outputAmount = inputAmount - fee;
      
      // Get current ledger info for deadline calculation
      const ledgerInfo = await this.getCurrentLedger();
      const deadline = ledgerInfo ? ledgerInfo.closeTime + 300 : undefined; // 5 minutes from now
      
      const route: BridgeRoute = {
        id: this.generateRouteId(this.provider, request.sourceChain, request.targetChain, 0),
        provider: this.provider,
        sourceChain: request.sourceChain,
        targetChain: request.targetChain,
        inputAmount: inputAmount.toString(),
        outputAmount: outputAmount.toString(),
        fee: fee.toString(),
        feePercentage: this.calculateFeePercentage(inputAmount.toString(), outputAmount.toString()),
        estimatedTime: this.estimateBridgeTime(request.targetChain),
        minAmountOut: this.calculateMinAmountOut(outputAmount.toString(), request.slippageTolerance),
        maxAmountOut: outputAmount.toString(),
        deadline,
        transactionData: {
          contractAddress: bridgeContractAddress,
          gasEstimate: '100000', // Estimated gas for Stellar operations
        },
        metadata: {
          description: `Bridge from Stellar to ${request.targetChain} via Soroban`,
          riskLevel: 1, // Stellar is considered very safe
          network: this.network,
          bridgeContract: bridgeContractAddress,
        },
      };
      
      return [route];
    } catch (error) {
      console.error(`[StellarAdapter] Error fetching routes from Stellar:`, error);
      return [];
    }
  }
  
  /**
   * Fetch routes when bridging TO Stellar FROM another chain
   */
  private async fetchRoutesToStellar(request: RouteRequest): Promise<BridgeRoute[]> {
    try {
      // For bridging TO Stellar, we need to query the source chain's bridge contract
      // This is a simplified implementation - in production, you'd query the actual bridge contract
      
      const inputAmount = BigInt(request.assetAmount);
      
      // Estimate fees (typically 0.1-0.5% for cross-chain bridges)
      const fee = inputAmount / 500n; // ~0.2% fee
      const outputAmount = inputAmount - fee;
      
      const route: BridgeRoute = {
        id: this.generateRouteId(this.provider, request.sourceChain, request.targetChain, 0),
        provider: this.provider,
        sourceChain: request.sourceChain,
        targetChain: request.targetChain,
        inputAmount: inputAmount.toString(),
        outputAmount: outputAmount.toString(),
        fee: fee.toString(),
        feePercentage: this.calculateFeePercentage(inputAmount.toString(), outputAmount.toString()),
        estimatedTime: this.estimateBridgeTime(request.sourceChain),
        minAmountOut: this.calculateMinAmountOut(outputAmount.toString(), request.slippageTolerance),
        maxAmountOut: outputAmount.toString(),
        transactionData: {
          contractAddress: request.tokenAddress, // Bridge contract on source chain
          gasEstimate: '200000', // Estimated gas for EVM chains
        },
        metadata: {
          description: `Bridge from ${request.sourceChain} to Stellar via Soroban`,
          riskLevel: 1,
          network: this.network,
        },
      };
      
      return [route];
    } catch (error) {
      console.error(`[StellarAdapter] Error fetching routes to Stellar:`, error);
      return [];
    }
  }
  
  /**
   * Get bridge contract address for target chain
   */
  private async getBridgeContractAddress(targetChain: ChainId): Promise<string | null> {
    // In production, this would query a registry or configuration
    // For now, return placeholder addresses
    const contractMap: Record<ChainId, string | null> = {
      ethereum: null, // Would be actual contract address
      polygon: null,
      arbitrum: null,
      optimism: null,
      base: null,
      stellar: null,
      gnosis: null,
      nova: null,
      bsc: null,
      avalanche: null,
    };
    
    return contractMap[targetChain] || null;
  }
  
  /**
   * Get current Stellar ledger information
   */
  private async getCurrentLedger(): Promise<{ closeTime: number; sequence: number } | null> {
    try {
      const response = await this.horizonClient.get('/ledgers?order=desc&limit=1');
      const ledgers = response.data?._embedded?.records;
      
      if (ledgers && ledgers.length > 0) {
        const ledger = ledgers[0];
        return {
          closeTime: parseInt(ledger.closed_at) || Math.floor(Date.now() / 1000),
          sequence: parseInt(ledger.sequence) || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[StellarAdapter] Error fetching ledger info:`, error);
      return null;
    }
  }
  
  /**
   * Estimate bridge time based on target chain
   */
  private estimateBridgeTime(chain: ChainId): number {
    // Stellar bridges are typically fast (1-5 minutes)
    // L2 chains are faster than L1
    if (chain === 'ethereum') {
      return 5 * 60; // 5 minutes for L1
    }
    return 2 * 60; // 2 minutes for L2 chains
  }
  
  /**
   * Calculate minimum amount out with slippage
   */
  private calculateMinAmountOut(amountOut: string, slippageTolerance?: number): string {
    const slippage = slippageTolerance || 0.5;
    const amount = BigInt(amountOut);
    const slippageAmount = (amount * BigInt(Math.floor(slippage * 100))) / 10000n;
    return (amount - slippageAmount).toString();
  }
}
