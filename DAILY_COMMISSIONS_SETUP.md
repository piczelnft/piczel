# Daily Commission System Setup

## Overview

The daily commission system has been implemented to distribute sponsor commissions over 365 days instead of giving them instantly. When a user buys an NFT, their sponsors will receive their commission amount spread out as daily payments over 365 days.

## How It Works

### 1. NFT Purchase Process
- When a user buys an NFT ($100 value), the system creates daily commission records for all sponsors (up to 10 levels)
- Each sponsor's commission is divided by 365 days
- Example: Level 1 sponsor gets 10% = $10, which becomes $10/365 = $0.0274 per day

### 2. Daily Commission Processing
- Each day, the system processes all active daily commission records
- Sponsors receive their daily amount added to their wallet balance and sponsor income
- Commission records are updated with payment status and remaining days

### 3. Commission Levels
- **Level 1 (Direct Sponsor)**: 10% over 365 days
- **Level 2**: 3% over 365 days  
- **Level 3**: 2% over 365 days
- **Level 4-5**: 1% over 365 days each
- **Level 6**: 1% over 365 days
- **Level 7-10**: 0.5% over 365 days each

## Setup Instructions

### 1. Environment Variables
Add the following environment variables to your `.env` file:

```env
# Admin token for automated commission processing
ADMIN_TOKEN=your_admin_jwt_token_here

# API base URL for the cron job
API_BASE_URL=http://localhost:3000
```

### 2. Manual Processing (Admin Interface)
1. Navigate to `/admin/commissions` in your admin panel
2. Click "Process Today's Commissions" button
3. The system will process all due commissions for the current day

### 3. Automated Processing (Cron Job)

#### Option A: Using the provided script
1. Make the script executable:
   ```bash
   chmod +x scripts/process-daily-commissions.js
   ```

2. Set up a cron job to run daily:
   ```bash
   # Edit crontab
   crontab -e
   
   # Add this line to run daily at 2 AM
   0 2 * * * cd /path/to/your/project && node scripts/process-daily-commissions.js
   ```

#### Option B: Using external cron service
You can use services like:
- **Cron-job.org**: Set up a webhook to call your API endpoint
- **GitHub Actions**: Create a scheduled workflow
- **Vercel Cron**: If using Vercel, set up serverless functions

### 4. API Endpoints

#### Process Daily Commissions
```
POST /api/admin/process-daily-commissions
Authorization: Bearer <admin_token>
```

#### Get Commission Statistics
```
GET /api/admin/process-daily-commissions
Authorization: Bearer <admin_token>
```

## Database Schema

### DailyCommission Model
```javascript
{
  userId: ObjectId,           // User who made the NFT purchase
  memberId: String,          // Member ID of the purchaser
  sponsorId: ObjectId,       // Sponsor who receives commission
  sponsorMemberId: String,   // Member ID of the sponsor
  nftPurchaseId: ObjectId,   // Reference to the NFT purchase
  totalCommission: Number,   // Total commission amount
  dailyAmount: Number,       // Amount to pay per day
  totalDays: Number,         // Total days (365)
  daysPaid: Number,          // Days already paid
  daysRemaining: Number,     // Days remaining
  totalPaid: Number,         // Total amount paid so far
  remainingAmount: Number,   // Amount remaining to be paid
  status: String,            // 'active', 'completed', 'cancelled'
  startDate: Date,           // When commission started
  endDate: Date,             // When commission ends
  lastPaymentDate: Date,     // Last payment date
  nextPaymentDate: Date      // Next payment due date
}
```

## Monitoring and Maintenance

### 1. Check Commission Status
Use the admin interface at `/admin/commissions` to monitor:
- Total commissions created
- Active commissions
- Completed commissions
- Total amounts paid

### 2. Troubleshooting
- Check server logs for commission processing errors
- Verify admin token is valid and has proper permissions
- Ensure database connection is working
- Check that the cron job is running properly

### 3. Manual Intervention
If needed, you can manually process commissions or fix issues through:
- Admin interface for manual processing
- Direct database queries to update commission records
- API calls to process specific commissions

## Benefits of Daily Commission System

1. **Long-term Income**: Sponsors receive steady income over 365 days
2. **User Retention**: Encourages long-term platform engagement
3. **Sustainable Growth**: Prevents instant large payouts that could destabilize the system
4. **Fair Distribution**: Ensures all sponsors benefit from their referrals over time

## Migration Notes

If you're migrating from the old instant commission system:
1. Existing sponsor income balances remain unchanged
2. New NFT purchases will use the daily commission system
3. Old commission records are not affected
4. Users will see their daily commission payments added to their balance gradually

## Security Considerations

- Admin tokens should be kept secure and rotated regularly
- Commission processing should be done in a secure environment
- Consider rate limiting for the commission processing API
- Monitor for unusual commission patterns or amounts
