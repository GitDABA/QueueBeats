// Simple test script to run the database health check function with environment variables
require('dotenv').config(); // This will load environment variables from .env file

// Import the function handler
const { handler } = require('./netlify/functions/database-health-check');

// Test function
async function testDatabaseHealthCheck() {
  console.log('Testing database-health-check function with environment variables:');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing'}`);
  
  try {
    // Call the function with a mock GET request
    const result = await handler({ httpMethod: 'GET' });
    console.log('\nFunction result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error running function:', error);
  }
}

// Run the test
testDatabaseHealthCheck();
