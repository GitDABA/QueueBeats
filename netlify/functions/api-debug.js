// Netlify Function to handle API debug endpoints
const { headers } = require('./utils/cors-headers');

exports.handler = async (event, context) => {
  // Parse the path to determine which debug endpoint was requested
  const path = event.path;
  
  // Default response
  let responseBody = {
    success: true,
    message: "API debug endpoint",
    timestamp: new Date().toISOString()
  };
  
  // Handle different debug endpoints
  if (path.includes('/debug/health')) {
    responseBody = {
      success: true,
      message: "Health check successful",
      status: "healthy",
      timestamp: new Date().toISOString()
    };
  } else if (path.includes('/debug/supabase')) {
    responseBody = {
      success: true,
      message: "Supabase connection check",
      status: "connected",
      timestamp: new Date().toISOString()
    };
  }
  
  // Return the response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(responseBody)
  };
};
