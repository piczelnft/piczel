/**
 * One-time migration script to update existing deactivation schedules
 * from 10-minute timer to 48-hour timer
 * 
 * Instructions:
 * 1. Make sure your Next.js app is running (npm run dev)
 * 2. Open your browser and go to: http://localhost:3000/api/users/reschedule-deactivations
 * 
 * OR run this script with your MongoDB URI:
 * MONGODB_URI="your-connection-string" node scripts/update-deactivation-schedules.js
 */

const mongoose = require('mongoose');

// MongoDB connection URI - must be provided via environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.log('\nPlease run with your MongoDB connection string:');
  console.log('MONGODB_URI="mongodb+srv://..." node scripts/update-deactivation-schedules.js');
  console.log('\nOR use the API endpoint: http://localhost:3000/api/users/reschedule-deactivations');
  process.exit(1);
}

// Define User schema
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function updateDeactivationSchedules() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}\n`);

    // Find all users with scheduled deactivations
    const usersWithSchedule = await User.find({
      isActivated: true,
      deactivationScheduledAt: { $ne: null }
    }).select('memberId name email deactivationScheduledAt');

    console.log(`Found ${usersWithSchedule.length} users with scheduled deactivations\n`);

    if (usersWithSchedule.length === 0) {
      console.log('No users to update. Exiting...');
      process.exit(0);
    }

    let updatedCount = 0;

    for (const user of usersWithSchedule) {
      const oldSchedule = new Date(user.deactivationScheduledAt);
      const newSchedule = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      console.log(`\n👤 ${user.memberId} (${user.name})`);
      console.log(`   Old schedule: ${oldSchedule.toISOString()}`);
      console.log(`   New schedule: ${newSchedule.toISOString()}`);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          deactivationScheduledAt: newSchedule
        }
      });

      updatedCount++;
      console.log(`   ✅ Updated`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Total users updated: ${updatedCount}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating deactivation schedules:', error);
    process.exit(1);
  }
}

// Run the migration
updateDeactivationSchedules();
