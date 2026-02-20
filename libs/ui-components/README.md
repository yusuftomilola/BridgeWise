# @bridgewise/ui-components

BridgeWise UI SDK components and hooks for cross-chain UX.

## Transaction History

The transaction history module provides a unified view across Stellar and EVM bridge executions.

### Data model

```ts
interface BridgeTransaction {
  txHash: string;
  bridgeName: string;
  sourceChain: string;
  destinationChain: string;
  sourceToken: string;
  destinationToken: string;
  amount: number;
  fee: number;
  slippagePercent: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  account: string;
}
```

### Hook usage

```tsx
import { useTransactionHistory } from '@bridgewise/ui-components';

const transactions = useTransactionHistory(account).transactions;
```

### Filtering and sorting

```tsx
const { transactions } = useTransactionHistory(account, {
  filter: {
    chain: 'ethereum',
    bridgeName: 'layerzero',
    status: 'confirmed',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
  },
  sortOrder: 'desc',
  includeBackend: true,
});
```

### Demo component

```tsx
import { BridgeHistory } from '@bridgewise/ui-components';

<BridgeHistory account={account} status="confirmed" />;
```

### Storage configuration

By default, history is persisted in browser local storage.

For server-side tracking, configure an optional backend in `TransactionProvider`:

```tsx
import {
  TransactionProvider,
  createHttpTransactionHistoryBackend,
} from '@bridgewise/ui-components';

const historyBackend = createHttpTransactionHistoryBackend({
  baseUrl: 'https://api.bridgewise.example.com',
});

<TransactionProvider
  historyConfig={{ backend: historyBackend }}
  onTransactionTracked={(tx) => {
    console.log('Tracked transaction', tx.txHash);
  }}
>
  {children}
</TransactionProvider>;
```
