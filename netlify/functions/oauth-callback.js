// Netlify Function for handling OAuth callback redirects
exports.handler = async (event) => {
  const { queryStringParameters } = event;
  const params = new URLSearchParams(queryStringParameters);
  
  // Get the redirect URL (frontend route that handles OAuth)
  const redirectUrl = process.env.SITE_URL || 'http://localhost:5280';
  
  // For Spotify OAuth
  if (params.has('code') && params.has('state')) {
    return {
      statusCode: 302,
      headers: {
        Location: `${redirectUrl}/auth/callback?${params.toString()}`
      }
    };
  }
  
  // Fallback for other OAuth providers or error states
  return {
    statusCode: 302,
    headers: {
      Location: `${redirectUrl}/auth/callback?error=invalid_request&${params.toString()}`
    }
  };
};
