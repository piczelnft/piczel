/**
 * Automated script to check and deactivate users with 0 holding wallet balance
 * Run this script periodically (e.g., every minute) using a cron job or task scheduler
 * 
 * Usage:
 * node scripts/check-user-deactivation.js
 * 
 * Or set up a cron job:
 * * * * * * cd /path/to/frontend && node scripts/check-user-deactivation.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function checkDeactivation() {
  try {
    console.log('🔍 Running user deactivation check...');
    console.log(`Calling: ${BASE_URL}/api/users/check-deactivation`);
    
    const response = await fetch(`${BASE_URL}/api/users/check-deactivation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Deactivation check completed successfully');
      console.log(`📊 Results: ${data.message}`);
      
      if (data.deactivatedUsers && data.deactivatedUsers.length > 0) {
        console.log('🔒 Deactivated users:');
        data.deactivatedUsers.forEach(user => {
          console.log(`  - ${user.memberId} (${user.name}) at ${user.deactivatedAt}`);
        });
      } else {
        console.log('✨ No users to deactivate at this time');
      }
    } else {
      console.error('❌ Deactivation check failed:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error running deactivation check:', error.message);
    throw error;
  }
}

// Run the check
checkDeactivation()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
