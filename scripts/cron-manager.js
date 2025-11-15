const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting User Deactivation Cron Job Manager...');
console.log(`📅 Current time: ${new Date().toISOString()}`);
console.log('⏰ Schedule: Every 1 minute');
console.log('=' .repeat(60));

// Run every minute
cron.schedule('* * * * *', () => {
  const now = new Date().toISOString();
  console.log(`\n⏰ [${now}] Running scheduled deactivation check...`);
  
  const scriptPath = path.join(__dirname, 'check-user-deactivation.js');
  
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error executing script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(stdout);
    }
  });
});

console.log('✅ Cron job scheduled successfully!');
console.log('📊 Monitoring for user deactivation checks...');
console.log('🛑 Press Ctrl+C to stop\n');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping cron job manager...');
  console.log('👋 Goodbye!');
  process.exit(0);
});
