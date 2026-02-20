# Fee & Slippage Benchmarking System

## Overview
BridgeWise calculates fees and monitors slippage for cross-chain transfers. The Fee & Slippage Benchmarking system tracks fees and slippage across all supported bridges and chains, providing historical and real-time benchmarking data to help developers and product teams evaluate bridge performance and optimize UX.

## Features
- Real-time and historical fee/slippage data collection
- Cross-chain comparison of bridge performance
- SSR-safe React hook for frontend integration
- Integration with analytics and dashboard components
- Automatic benchmarking of executed transactions

## Core Interface

The system uses the `FeeSlippageBenchmark` interface to represent benchmark data:

```typescript
interface FeeSlippageBenchmark {
  /** Bridge name */
  bridgeName: BridgeProvider;
  /** Source chain identifier */
  sourceChain: ChainId;
  /** Destination chain identifier */
  destinationChain: ChainId;
  /** Token symbol or address */
  token: string;
  /** Average fee in token units */
  avgFee: number;
  /** Average slippage percentage */
  avgSlippagePercent: number;
  /** Timestamp of benchmark record */
  timestamp: Date;
  /** Minimum fee observed */
  minFee?: number;
  /** Maximum fee observed */
  maxFee?: number;
  /** Minimum slippage observed */
  minSlippagePercent?: number;
  /** Maximum slippage observed */
  maxSlippagePercent?: number;
  /** Sample size used for calculation */
  sampleSize?: number;
}
```

## Backend Implementation

### Benchmark Service
The backend provides a `BenchmarkService` that:

- Collects real-time and historical fee and slippage data
- Processes completed transactions to extract benchmark metrics
- Stores historical benchmarks for trend analysis
- Provides API endpoints for retrieving benchmark data

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/benchmark/process-transaction` | POST | Process a completed transaction for benchmarking |
| `/benchmark/fees-slippage` | GET | Get benchmarks by query criteria |
| `/benchmark/fees-slippage/latest` | GET | Get the latest benchmark for a specific route |
| `/benchmark/fees-slippage/average` | GET | Get historical averages for a specific route |

### Usage Example

```typescript
// Process a completed transaction
await benchmarkService.processTransaction({
  provider: 'hop',
  sourceChain: 'ethereum',
  destinationChain: 'polygon',
  token: 'USDC',
  feePercentage: 0.45,
  slippage: 0.12,
  inputAmount: '1000000000',
  outputAmount: '995000000'
});
```

## Frontend Implementation

### useFeeSlippageBenchmark Hook

The `useFeeSlippageBenchmark` hook provides access to benchmark data in React applications:

```typescript
import { useFeeSlippageBenchmark } from '@bridgewise/ui-components';

const MyComponent = () => {
  const { 
    benchmarks, 
    loading, 
    error, 
    refreshBenchmarks, 
    latestBenchmark, 
    averageBenchmark 
  } = useFeeSlippageBenchmark({
    token: "USDC",
    sourceChain: "ethereum",
    destinationChain: "polygon",
  });

  if (loading) return <div>Loading benchmarks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Historical Average: {averageBenchmark?.avgFee}% fee</h2>
      {benchmarks.map(benchmark => (
        <div key={`${benchmark.bridgeName}-${benchmark.timestamp}`}>
          {benchmark.bridgeName}: {benchmark.avgFee}% fee
        </div>
      ))}
      <button onClick={refreshBenchmarks}>Refresh</button>
    </div>
  );
};
```

### BridgeCompare Component

The `BridgeCompare` component displays benchmark data alongside current quotes:

```typescript
import { BridgeCompare } from '@bridgewise/ui-components';

const BridgeComparison = ({ routes }) => {
  return (
    <BridgeCompare 
      routes={routes}
      token="USDC"
      sourceChain="ethereum"
      destinationChain="polygon"
      showBenchmarkComparison={true}
      onRouteSelect={(route) => console.log('Selected:', route)}
    />
  );
};
```

## Data Collection Process

1. When a transaction completes, the system extracts fee and slippage data
2. This data is processed and stored in the benchmark database
3. Historical averages are calculated and maintained
4. Frontend components can query this data via the hook or API
5. The BridgeCompare component displays current routes alongside historical benchmarks

## Error Handling & Fallbacks

The system handles missing or incomplete benchmarking data gracefully:

- Returns empty arrays when no benchmarks are available
- Provides fallback mechanisms for API failures
- Maintains component functionality even when benchmarks are unavailable
- Logs errors for monitoring and debugging

## Integration Points

### With Transaction Processing
- Automatically captures fee and slippage data from completed transactions
- Updates benchmarks in real-time

### With Analytics Dashboard
- Feeds historical data to analytics systems
- Provides trend analysis capabilities

### With Route Recommendation Engine
- Supplies historical performance data for route optimization
- Helps recommend cost-efficient bridge routes

## Testing

Unit tests cover:
- Data collection and storage
- Hook functionality and state management
- API endpoint responses
- Error handling scenarios
- Cross-chain comparison logic

## Performance Considerations

- Benchmarks are stored with time-based retention (last 100 records per route)
- API endpoints support pagination and filtering
- Frontend hook includes caching and refresh controls
- Database queries are optimized for common access patterns

## Security

- API endpoints are secured with appropriate authentication
- Sensitive transaction data is not exposed through benchmark APIs
- Rate limiting is applied to prevent abuse