#!/usr/bin/env node

/**
 * Automatic Commission Processing Script
 * 
 * This script runs continuously and processes commissions every minute for demo mode.
 * It calls the auto-process-commissions API endpoint every 60 seconds.
 * 
 * Usage:
 * node scripts/auto-process-commissions.js
 * 
 * For production, you might want to use PM2 or similar process manager:
 * pm2 start scripts/auto-process-commissions.js --name "commission-processor"
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const PROCESS_INTERVAL = 300 * 1000; // 300 seconds (5 minutes)

console.log('🚀 Starting Automatic Commission Processing Service');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log(`⏰ Processing Interval: ${PROCESS_INTERVAL / 1000} seconds`);

async function processCommissions() {
  try {
    const url = `${API_BASE_URL}/api/auto-process-commissions`;
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await makeRequest(url, options);
    
    if (response.status === 200) {
      const data = JSON.parse(response.data);
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`✅ [${timestamp}] Commissions processed successfully!`);
      console.log(`📊 Summary:`);
      console.log(`   - Processed: ${data.summary.totalProcessed} commissions`);
      console.log(`   - Total Amount: $${data.summary.totalAmount}`);
      console.log(`   - Completed: ${data.summary.completedCommissions} commissions`);
      console.log(`   - Errors: ${data.summary.errors}`);
      
      if (data.errors && data.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        data.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      if (data.processedCommissions && data.processedCommissions.length > 0) {
        console.log('💰 Processed Commissions:');
        data.processedCommissions.forEach(comm => {
          console.log(`   - ${comm.sponsorName} (${comm.sponsorId}): $${comm.paymentAmount} - Days Remaining: ${comm.daysRemaining}`);
        });
      }
    } else {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Failed to process commissions`);
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${response.data}`);
    }
    
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Error processing commissions:`, error.message);
  }
}

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Start the automatic processing
console.log('🔄 Starting automatic commission processing...');

// Process immediately on startup
processCommissions();

// Set up interval to process every minute
const interval = setInterval(processCommissions, PROCESS_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down automatic commission processing...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down automatic commission processing...');
  clearInterval(interval);
  process.exit(0);
});

console.log('✅ Automatic commission processing service is running');
console.log('Press Ctrl+C to stop the service');