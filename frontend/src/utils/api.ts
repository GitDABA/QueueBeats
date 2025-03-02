import brain from '../brain';
import { API_PATH } from './constants';

// Determine if we're in a deployed environment vs local development
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// We'll store the API base URL once we've determined it
let cachedApiUrl: string | null = null;

// Use this function to get the correct API URL in all environments
export const getApiUrl = () => {
  // If we've already determined the API URL, use the cached value
  if (cachedApiUrl) return cachedApiUrl;
  
  if (isLocalhost) {
    // In local development, use the standard origin + API_PATH
    cachedApiUrl = `${window.location.origin}${API_PATH}`;
    console.log('Local development API URL:', cachedApiUrl);
    return cachedApiUrl;
  } else {
    // For Databutton deployed apps, the correct format is:
    // https://[app-name].databutton.app/api
    cachedApiUrl = `${window.location.origin}/api`;
    // For debugging - helps identify issues with API path construction
    console.log('Production API access details:', {
      origin: window.location.origin,
      apiPath: '/api',
      fullUrl: cachedApiUrl,
      hostname: window.location.hostname,
    });
    console.log('Production API URL:', cachedApiUrl);
    return cachedApiUrl;
  }
};

// Create a wrapper for all brain methods to ensure they use the correct base URL
const apiBrain = Object.entries(brain).reduce((acc, [key, method]) => {
  if (typeof method === 'function') {
    // @ts-ignore - We're dynamically wrapping all methods
    acc[key] = (...args: any[]) => {
      // For methods that take params as last argument
      if (args.length > 0) {
        const lastArg = args[args.length - 1];
        if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg)) {
          // Add baseUrl to the params
          args[args.length - 1] = { ...lastArg, baseUrl: getApiUrl() };
        } else {
          // Add params with baseUrl
          args.push({ baseUrl: getApiUrl() });
        }
      } else {
        // No args, add params with baseUrl
        args.push({ baseUrl: getApiUrl() });
      }
      
      // @ts-ignore - Call the original method with updated args
      return method(...args);
    };
  } else {
    acc[key] = method;
  }
  return acc;
}, {} as typeof brain);

export default apiBrain;
