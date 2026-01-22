/**
 * Example usage of @bridgewise/bridge-core
 * 
 * This file demonstrates how to use the bridge aggregation library
 * to fetch and compare routes from multiple bridge providers.
 */

import { getBridgeRoutes, BridgeAggregator } from './index';

/**
 * Example 1: Simple route discovery
 */
async function exampleSimple() {
  console.log('=== Example 1: Simple Route Discovery ===\n');
  
  const routes = await getBridgeRoutes({
    sourceChain: 'ethereum',
    targetChain: 'polygon',
    assetAmount: '1000000000000000000', // 1 ETH in wei
    slippageTolerance: 0.5,
  });
  
  console.log(`Found ${routes.routes.length} routes from ${routes.providersResponded}/${routes.providersQueried} providers\n`);
  
  routes.routes.forEach((route, index) => {
    console.log(`Route ${index + 1}: ${route.provider}`);
    console.log(`  Fee: ${route.feePercentage}%`);
    console.log(`  Estimated Time: ${route.estimatedTime}s`);
    console.log(`  Output Amount: ${route.outputAmount}`);
    console.log(`  Min Amount Out: ${route.minAmountOut}`);
    console.log('');
  });
}

/**
 * Example 2: Using the Aggregator class with custom configuration
 */
async function exampleAdvanced() {
  console.log('=== Example 2: Advanced Configuration ===\n');
  
  const aggregator = new BridgeAggregator({
    providers: {
      hop: true,
      layerzero: true,
      stellar: true,
    },
    layerZeroApiKey: process.env.LAYERZERO_API_KEY, // Optional
    timeout: 20000, // 20 seconds
  });
  
  const routes = await aggregator.getRoutes({
    sourceChain: 'stellar',
    targetChain: 'ethereum',
    assetAmount: '1000000000', // Amount in smallest unit
    tokenAddress: '0x...', // Optional token address
    slippageTolerance: 1.0,
    recipientAddress: '0x...', // Optional recipient
  });
  
  if (routes.routes.length > 0) {
    const bestRoute = routes.routes[0];
    console.log(`Best Route: ${bestRoute.provider}`);
    console.log(`  Fee: ${bestRoute.feePercentage}%`);
    console.log(`  Time: ${bestRoute.estimatedTime}s`);
    
    if (bestRoute.transactionData) {
      console.log(`  Contract: ${bestRoute.transactionData.contractAddress}`);
      console.log(`  Gas Estimate: ${bestRoute.transactionData.gasEstimate}`);
    }
  } else {
    console.log('No routes found');
  }
}

/**
 * Example 3: Filtering routes by criteria
 */
async function exampleFiltering() {
  console.log('=== Example 3: Filtering Routes ===\n');
  
  const routes = await getBridgeRoutes({
    sourceChain: 'arbitrum',
    targetChain: 'optimism',
    assetAmount: '500000000000000000', // 0.5 ETH
  });
  
  // Filter routes with fee < 1%
  const lowFeeRoutes = routes.routes.filter(route => route.feePercentage < 1);
  console.log(`Routes with fee < 1%: ${lowFeeRoutes.length}`);
  
  // Filter routes with time < 5 minutes
  const fastRoutes = routes.routes.filter(route => route.estimatedTime < 300);
  console.log(`Routes faster than 5 minutes: ${fastRoutes.length}`);
  
  // Find route with highest output amount
  const bestOutputRoute = routes.routes.reduce((best, current) => {
    return BigInt(current.outputAmount) > BigInt(best.outputAmount) ? current : best;
  }, routes.routes[0]);
  
  console.log(`Best output route: ${bestOutputRoute.provider} with ${bestOutputRoute.outputAmount}`);
}

// Run examples (commented out to avoid execution during build)
// Uncomment to run:
// exampleSimple().catch(console.error);
// exampleAdvanced().catch(console.error);
// exampleFiltering().catch(console.error);
