const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Sample data to populate the database
const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    mobile: "+1234567890",
    password: "password123",
    isActivated: true,
    activatedAt: new Date(),
    walletBalance: 1500.50,
    fundBalance: 750.25,
    totalDeposit: 5000.00,
    totalWithdrawal: 1000.00,
    sponsorIncome: 500.00,
    levelIncome: 300.00,
    roiIncome: 150.00,
    committeeIncome: 200.00,
    rewardIncome: 100.00,
    isBlocked: false
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    mobile: "+1234567891",
    password: "password123",
    isActivated: true,
    activatedAt: new Date(),
    walletBalance: 2300.75,
    fundBalance: 1200.50,
    totalDeposit: 8000.00,
    totalWithdrawal: 1500.00,
    sponsorIncome: 800.00,
    levelIncome: 450.00,
    roiIncome: 200.00,
    committeeIncome: 350.00,
    rewardIncome: 150.00,
    isBlocked: false
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    mobile: "+1234567892",
    password: "password123",
    isActivated: false,
    activatedAt: null,
    walletBalance: 0,
    fundBalance: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    sponsorIncome: 0,
    levelIncome: 0,
    roiIncome: 0,
    committeeIncome: 0,
    rewardIncome: 0,
    isBlocked: false
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    mobile: "+1234567893",
    password: "password123",
    isActivated: true,
    activatedAt: new Date(),
    walletBalance: 5000.00,
    fundBalance: 2500.00,
    totalDeposit: 15000.00,
    totalWithdrawal: 3000.00,
    sponsorIncome: 1200.00,
    levelIncome: 800.00,
    roiIncome: 500.00,
    committeeIncome: 600.00,
    rewardIncome: 300.00,
    isBlocked: false
  },
  {
    name: "Blocked User",
    email: "blocked@example.com",
    mobile: "+1234567894",
    password: "password123",
    isActivated: true,
    activatedAt: new Date(),
    walletBalance: 100.00,
    fundBalance: 50.00,
    totalDeposit: 500.00,
    totalWithdrawal: 200.00,
    sponsorIncome: 50.00,
    levelIncome: 30.00,
    roiIncome: 20.00,
    committeeIncome: 40.00,
    rewardIncome: 25.00,
    isBlocked: true
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://haldarainit:haldar123@cluster0.ue0hdtk.mongodb.net/blockchain?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Insert sample users
    const insertedUsers = await User.insertMany(sampleUsers);
    console.log(`Inserted ${insertedUsers.length} sample users`);

    // Display summary
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActivated: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    
    console.log('\n=== Database Summary ===');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Blocked Users: ${blockedUsers}`);

    // Calculate totals
    const users = await User.find({});
    let totalWalletBalance = 0;
    let totalFundBalance = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    users.forEach(user => {
      totalWalletBalance += user.walletBalance || 0;
      totalFundBalance += user.fundBalance || 0;
      totalDeposits += user.totalDeposit || 0;
      totalWithdrawals += user.totalWithdrawal || 0;
    });

    console.log(`Total Wallet Balance: $${totalWalletBalance.toFixed(2)}`);
    console.log(`Total Fund Balance: $${totalFundBalance.toFixed(2)}`);
    console.log(`Total Deposits: $${totalDeposits.toFixed(2)}`);
    console.log(`Total Withdrawals: $${totalWithdrawals.toFixed(2)}`);

    console.log('\n✅ Sample data seeded successfully!');
    console.log('You can now test the admin dashboard with real data.');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedData();
