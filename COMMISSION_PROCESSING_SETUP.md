# Automatic Commission Processing for Demo Mode

## Overview

This system automatically processes commission payments every minute for demo testing. When users buy NFTs, their sponsors receive commissions distributed over 5 minutes (instead of 365 days).

## How It Works

1. **NFT Purchase**: User buys NFT for $100
2. **Commission Creation**: Creates daily commission records for 5 minutes
3. **Automatic Processing**: Every minute, commissions are processed and paid out
4. **Level Income Updates**: Sponsors see their level income increase every minute

## Setup Instructions

### Option 1: Run Commission Processor Script

1. **Start the main application**:
   ```bash
   npm run dev
   ```

2. **In a separate terminal, start the commission processor**:
   ```bash
   npm run commission-processor
   ```

### Option 2: Manual Testing

You can also manually trigger commission processing by calling:
```
GET http://localhost:3000/api/auto-process-commissions
```

## Commission Distribution (Demo Mode)

When a user buys an NFT for $100:

| Level | Total Commission | Per Minute | Duration |
|-------|------------------|------------|----------|
| L1 | $10.00 | $2.00/minute | 5 minutes |
| L2 | $3.00 | $0.60/minute | 5 minutes |
| L3 | $2.00 | $0.40/minute | 5 minutes |
| L4-L6 | $1.00 each | $0.20/minute each | 5 minutes |
| L7-L10 | $0.50 each | $0.10/minute each | 5 minutes |

## Expected Behavior

1. **Buy NFT** → Creates commission records
2. **Wait 1 minute** → Level income increases by per-minute amount
3. **Wait another minute** → Level income increases again
4. **Continue for 5 minutes** → All commissions paid out

## Commission Conditions

- **L1**: No condition (always receives)
- **L2**: Needs 3 direct members
- **L3**: Needs 2 direct members  
- **L4-L10**: Needs active trade (NFT within 48 hours)

## Files Modified

- `frontend/app/api/admin/process-daily-commissions/route.js` - Updated to use 1-minute intervals
- `frontend/app/api/auto-process-commissions/route.js` - New API for automatic processing
- `frontend/scripts/auto-process-commissions.js` - Background script that runs every minute
- `frontend/package.json` - Added commission-processor script

## Testing

1. Start both the main app and commission processor
2. Buy an NFT
3. Watch the dashboard - level income should increase every minute
4. Check console logs for processing details

## Stopping the Service

Press `Ctrl+C` in the terminal running the commission processor to stop it.

## Production Notes

For production, consider using:
- PM2 process manager
- Docker containers
- Kubernetes cron jobs
- Cloud functions with scheduled triggers
