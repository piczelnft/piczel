# User Deactivation Based on Holding Wallet Balance

## Overview

This feature automatically deactivates user accounts when their holding wallet balance becomes 0 and reactivates them when they purchase an NFT.

## How It Works

### 1. Holding Wallet Balance Tracking

- Each user has a `holdingWalletBalance` field that tracks the balance from NFT purchases
- When a user buys an NFT, their holding wallet balance increases by $100
- When a user makes a withdrawal, their holding wallet balance decreases

### 2. Deactivation Scheduling

When a user's holding wallet balance reaches 0:
- A `deactivationScheduledAt` timestamp is set to 10 minutes in the future
- The user remains active during this 10-minute grace period
- If the user purchases an NFT within 10 minutes, the scheduled deactivation is cancelled

### 3. Automatic Deactivation

After 10 minutes with 0 holding wallet balance:
- The user's `isActivated` status is set to `false`
- The user stops receiving spot income and level commissions
- All upline commission distributions skip inactive users

### 4. Reactivation

When an inactive user purchases an NFT:
- The user's `isActivated` status is set back to `true`
- Their `activatedAt` timestamp is updated
- The `deactivationScheduledAt` is cleared
- Their holding wallet balance is increased
- They can receive income and commissions again

## Database Schema Changes

### User Model Updates

```javascript
{
  // New fields added to User model
  holdingWalletBalance: {
    type: Number,
    default: 0,
  },
  deactivationScheduledAt: {
    type: Date,
    default: null,
  }
}
```

## API Endpoints

### 1. Check Deactivation Endpoint

**Endpoint:** `POST /api/users/check-deactivation`

This endpoint checks for users who should be deactivated and deactivates them.

**Response:**
```json
{
  "success": true,
  "message": "Deactivated 2 users",
  "deactivatedUsers": [
    {
      "memberId": "M12345",
      "name": "John Doe",
      "email": "john@example.com",
      "deactivatedAt": "2025-11-15T10:30:00.000Z"
    }
  ],
  "checkedAt": "2025-11-15T10:30:00.000Z"
}
```

**Status Check:** `GET /api/users/check-deactivation`

Returns information about users scheduled for deactivation:
```json
{
  "currentTime": "2025-11-15T10:30:00.000Z",
  "tenMinutesAgo": "2025-11-15T10:20:00.000Z",
  "totalScheduled": 5,
  "readyToDeactivate": 2,
  "scheduledUsers": [
    {
      "memberId": "M12345",
      "name": "John Doe",
      "holdingBalance": 0,
      "scheduledAt": "2025-11-15T10:15:00.000Z",
      "minutesUntilDeactivation": 5
    }
  ]
}
```

## Automated Checking

### Cron Job Setup

A script is provided to automatically check for users to deactivate:

**Script Location:** `scripts/check-user-deactivation.js`

#### Windows Task Scheduler Setup

1. Open Task Scheduler
2. Create a new task
3. Set trigger to run every 1 minute
4. Set action to run:
   ```
   node C:\path\to\frontend\scripts\check-user-deactivation.js
   ```

#### Linux/Mac Cron Setup

Add to crontab:
```bash
* * * * * cd /path/to/frontend && node scripts/check-user-deactivation.js >> /var/log/user-deactivation.log 2>&1
```

### Vercel Cron Jobs

If deployed on Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/users/check-deactivation",
    "schedule": "* * * * *"
  }]
}
```

## Commission Distribution Changes

### Spot Income Distribution

Spot income (L1: $3, L2: $1, L3: $1) is only distributed to **active** users who meet the conditions:
- L1: Must have purchased at least one NFT AND be active
- L2: Must have 3+ direct members AND be active
- L3: Must have 5+ direct members AND be active

### Level Commission Distribution

Level commissions (10 levels, 10%-0.5%) are only distributed to **active** users who meet the conditions:
- All levels: User must be active (isActivated: true)
- L1: Must have purchased at least one NFT
- L2: Must have 3+ direct members
- L3: Must have 5+ direct members
- L4-L10: Must have purchased NFT within last 48 hours

## NFT Purchase Flow

When a user purchases an NFT:

1. User's wallet balance increases by $100
2. User's holding wallet balance increases by $100
3. If user was inactive, they are reactivated:
   - `isActivated` set to `true`
   - `activatedAt` updated to current time
   - `deactivationScheduledAt` cleared
4. Spot income distributed to 3 levels (if sponsors are active)
5. Level commissions distributed to 10 levels (if sponsors are active)

## Withdrawal Flow

When a user makes a withdrawal:

1. Withdrawal amount deducted from wallet balance
2. Withdrawal amount deducted from holding wallet balance
3. Withdrawal amount deducted from specific income type (spot or level)
4. If holding wallet balance reaches 0:
   - `deactivationScheduledAt` set to 10 minutes in the future
   - User receives warning in withdrawal response
5. User has 10 minutes to purchase an NFT to prevent deactivation

## Testing

### Manual Testing

1. **Test Deactivation Scheduling:**
   ```bash
   # User makes withdrawal that brings holding balance to 0
   # Check user record - should have deactivationScheduledAt set
   ```

2. **Test Automatic Deactivation:**
   ```bash
   # Wait 10+ minutes
   # Run: POST /api/users/check-deactivation
   # Check user record - should be inactive
   ```

3. **Test Reactivation:**
   ```bash
   # Inactive user purchases NFT
   # Check user record - should be active again
   ```

4. **Test Income Distribution:**
   ```bash
   # Active user purchases NFT -> sponsors receive income
   # Inactive user purchases NFT -> sponsors DO NOT receive income
   ```

### Status Check

Check current deactivation schedule:
```bash
GET http://localhost:3000/api/users/check-deactivation
```

## Monitoring

### Log Messages

The system logs important events:

- `⏰ Scheduling deactivation for user {memberId} at {timestamp}` - When deactivation is scheduled
- `🔍 Checking for users to deactivate...` - When deactivation check runs
- `Deactivating user: {memberId}` - When user is deactivated
- `🔓 Reactivating user {memberId} due to NFT purchase` - When user is reactivated
- `L{X} Sponsor {memberId} is INACTIVE - skipping income` - When income distribution is skipped

### Dashboard Monitoring

Consider adding to admin dashboard:
- Count of users scheduled for deactivation
- List of recently deactivated users
- Count of inactive users
- Holding wallet balance distribution

## Important Notes

1. **Grace Period:** Users have exactly 10 minutes after holding balance reaches 0 to purchase an NFT
2. **Commission Impact:** Inactive users cannot receive ANY income (spot or level)
3. **Upline Impact:** If a user is inactive, their upline still processes normally (just this user is skipped)
4. **Multiple Purchases:** Each NFT purchase adds $100 to holding wallet balance
5. **Partial Withdrawals:** Withdrawals reduce holding balance proportionally

## Future Enhancements

Potential improvements:
- Email notification when deactivation is scheduled
- Email notification when deactivated
- Admin dashboard to manually activate/deactivate users
- Configurable grace period (instead of fixed 10 minutes)
- Warning notification at 5 minutes before deactivation
