#!/usr/bin/env node

/**
 * Daily Commission Processing Script
 * 
 * This script should be run daily (preferably via cron job) to process
 * all daily commission payments that are due.
 * 
 * Usage:
 * node scripts/process-daily-commissions.js
 * 
 * Cron job example (runs daily at 2 AM):
 * 0 2 * * * cd /path/to/your/project && node scripts/process-daily-commissions.js
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // Set this in your environment variables

if (!ADMIN_TOKEN) {
  console.error('Error: ADMIN_TOKEN environment variable is required');
  process.exit(1);
}

async function processDailyCommissions() {
  try {
    console.log('Starting daily commission processing...');
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    const url = `${API_BASE_URL}/api/admin/process-daily-commissions`;
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await makeRequest(url, options);
    
    if (response.status === 200) {
      const data = JSON.parse(response.data);
      console.log('✅ Daily commissions processed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Processed: ${data.summary.totalProcessed} commissions`);
      console.log(`   - Total Amount: $${data.summary.totalAmount}`);
      console.log(`   - Completed: ${data.summary.completedCommissions} commissions`);
      console.log(`   - Errors: ${data.summary.errors}`);
      
      if (data.errors && data.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        data.errors.forEach(error => console.log(`   - ${error}`));
      }
    } else {
      console.error('❌ Failed to process daily commissions');
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${response.data}`);
    }
    
  } catch (error) {
    console.error('❌ Error processing daily commissions:', error.message);
    process.exit(1);
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

// Run the script
if (require.main === module) {
  processDailyCommissions()
    .then(() => {
      console.log('✅ Daily commission processing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { processDailyCommissions };
