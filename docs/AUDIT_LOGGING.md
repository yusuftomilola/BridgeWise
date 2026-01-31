# Audit Logging & Compliance

## Overview

BridgeWise implements structured audit logging for all critical operations including route selection, transaction execution, and fee estimation. This ensures full traceability for debugging and future compliance requirements.

## Key Features

✅ **Structured JSON Logging** - All audit events are logged in JSON format for easy parsing  
✅ **Sensitive Data Protection** - Private keys, full amounts, and addresses are sanitized  
✅ **Request Tracing** - Request IDs link related operations across services  
✅ **Event Types** - Categorized events for filtering and analysis  
✅ **Timestamp Precision** - ISO 8601 timestamps for all events  

## Event Types

### ROUTE_SELECTION
Logged when a bridge route is selected from available options.

**Fields:**
- `sourceChain` - Origin blockchain
- `destinationChain` - Target blockchain
- `amount` - Transfer amount (sanitized)
- `selectedAdapter` - Chosen bridge provider
- `routeScore` - Ranking score of selected route
- `alternativeCount` - Number of alternative routes available

**Example:**
```json
{
  "eventType": "ROUTE_SELECTION",
  "timestamp": "2026-01-30T17:35:00.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "sourceChain": "ethereum",
    "destinationChain": "stellar",
    "amount": "1000...0000",
    "selectedAdapter": "stellar",
    "routeScore": 0.95,
    "alternativeCount": 2
  }
}
```

### ROUTE_EXECUTION
Logged when a bridge transfer is executed.

**Fields:**
- `transactionId` - Internal transaction ID
- `adapter` - Bridge provider used
- `sourceChain` - Origin blockchain
- `destinationChain` - Target blockchain
- `status` - Execution status (initiated/confirmed/failed)
- `executionTimeMs` - Time taken in milliseconds

**Example:**
```json
{
  "eventType": "ROUTE_EXECUTION",
  "timestamp": "2026-01-30T17:35:05.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "transactionId": "tx-xyz789",
    "adapter": "layerzero",
    "sourceChain": "ethereum",
    "destinationChain": "polygon",
    "status": "confirmed",
    "executionTimeMs": 5234
  }
}
```

### TRANSACTION_CREATED
Logged when a new transaction is created.

**Fields:**
- `transactionId` - Unique transaction identifier
- `type` - Transaction type
- `totalSteps` - Number of steps in transaction

**Example:**
```json
{
  "eventType": "TRANSACTION_CREATED",
  "timestamp": "2026-01-30T17:35:00.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "transactionId": "tx-xyz789",
    "type": "stellar-payment",
    "totalSteps": 3
  }
}
```

### TRANSACTION_UPDATED
Logged when transaction status changes.

**Fields:**
- `transactionId` - Transaction identifier
- `previousStatus` - Status before update
- `newStatus` - Status after update
- `currentStep` - Current step number

**Example:**
```json
{
  "eventType": "TRANSACTION_UPDATED",
  "timestamp": "2026-01-30T17:35:02.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "transactionId": "tx-xyz789",
    "previousStatus": "PENDING",
    "newStatus": "IN_PROGRESS",
    "currentStep": 1
  }
}
```

### FEE_ESTIMATION
Logged when fee estimates are retrieved.

**Fields:**
- `adapter` - Bridge provider
- `sourceChain` - Origin blockchain
- `destinationChain` - Target blockchain
- `estimatedFee` - Fee amount (sanitized)
- `responseTimeMs` - API response time

**Example:**
```json
{
  "eventType": "FEE_ESTIMATION",
  "timestamp": "2026-01-30T17:34:55.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "adapter": "hop",
    "sourceChain": "ethereum",
    "destinationChain": "optimism",
    "estimatedFee": "0.00...0123",
    "responseTimeMs": 234
  }
}
```

### BRIDGE_TRANSFER
Logged during bridge transfer operations.

**Fields:**
- `transactionId` - Transaction identifier
- `adapter` - Bridge provider
- `txHash` - Blockchain transaction hash (sanitized)
- `status` - Transfer status
- `errorCode` - Error code if failed

**Example:**
```json
{
  "eventType": "BRIDGE_TRANSFER",
  "timestamp": "2026-01-30T17:35:10.000Z",
  "requestId": "req-abc123",
  "metadata": {
    "transactionId": "tx-xyz789",
    "adapter": "stellar",
    "txHash": "a1b2c3d4...e5f6g7h8",
    "status": "confirmed"
  }
}
```

## Data Sanitization

### Amounts
Large amounts are truncated to show only first 4 and last 4 characters:
- Input: `1000000000000000000`
- Logged: `1000...0000`

### Transaction Hashes
Hashes are truncated to show only first 8 and last 8 characters:
- Input: `0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`
- Logged: `a1b2c3d4...e5f6g7h8`

### Excluded Data
The following are **never** logged:
- Private keys
- Wallet mnemonics
- Full account addresses
- API keys
- Authentication tokens
- User passwords

## Usage

### In NestJS Services

```typescript
import { AuditLoggerService } from '../common/logger/audit-logger.service';

@Injectable()
export class MyService {
  constructor(private auditLogger: AuditLoggerService) {}

  async processTransaction(tx: Transaction) {
    this.auditLogger.logTransactionCreated({
      transactionId: tx.id,
      type: tx.type,
      totalSteps: tx.totalSteps,
    });
  }
}
```

### In Bridge Core Library

```typescript
import { BridgeAggregator, AuditLogger } from '@bridgewise/bridge-core';

const auditLogger: AuditLogger = {
  logRouteSelection: (data) => console.log(JSON.stringify(data)),
  logRouteExecution: (data) => console.log(JSON.stringify(data)),
};

const aggregator = new BridgeAggregator({
  auditLogger,
});
```

## Log Storage

Logs are written to:
- **Development**: Console (stdout)
- **Production**: Configured log aggregation service (e.g., CloudWatch, Datadog)

## Querying Logs

### Filter by Event Type
```bash
# Get all route selections
grep '"eventType":"ROUTE_SELECTION"' app.log | jq .
```

### Filter by Request ID
```bash
# Trace all events for a specific request
grep '"requestId":"req-abc123"' app.log | jq .
```

### Filter by Transaction ID
```bash
# Track transaction lifecycle
grep '"transactionId":"tx-xyz789"' app.log | jq .
```

### Performance Analysis
```bash
# Find slow fee estimations (>1000ms)
grep '"eventType":"FEE_ESTIMATION"' app.log | jq 'select(.metadata.responseTimeMs > 1000)'
```

## Compliance Considerations

### GDPR
- No personally identifiable information (PII) is logged
- Wallet addresses are sanitized
- User data can be purged by transaction ID

### SOC 2
- All critical operations are logged
- Logs include timestamps and request tracing
- Failed operations are logged with error codes

### Financial Regulations
- Transaction amounts are logged (sanitized)
- Fee calculations are auditable
- Route selection rationale is captured

## Best Practices

1. **Always include request IDs** - Links related operations
2. **Log before and after state changes** - Captures full context
3. **Use structured data** - Enables automated analysis
4. **Sanitize sensitive data** - Protects user privacy
5. **Include timing information** - Helps identify bottlenecks

## Future Enhancements

- [ ] Log retention policies
- [ ] Automated log analysis and alerting
- [ ] Integration with SIEM systems
- [ ] Compliance report generation
- [ ] User-facing audit trail API

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Error Codes](./API_ERRORS.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
