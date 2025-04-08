import axios from 'axios';

/**
 * Get the API base URL based on the current environment
 */
export const getApiBaseUrl = (): string => {
  const currentUrl = window.location.origin;
  // In development, we're likely running the frontend on a different port than the backend
  const apiBaseUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') 
    ? 'http://localhost:3000' 
    : currentUrl;
  return apiBaseUrl;
};

/**
 * Test if the API server is available
 */
export const testApiConnection = async (): Promise<boolean> => {
  const apiBaseUrl = getApiBaseUrl();
  try {
    console.log('Testing API connection to:', apiBaseUrl);
    const response = await axios.get(`${apiBaseUrl}/api/test`, { timeout: 3000 });
    console.log('API connection test result:', response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    console.log('Please ensure the server is running at:', apiBaseUrl);
    console.log('You can start the server by running: node server/server.js');
    return false;
  }
};

/**
 * Format an error message from an API call
 */
export const formatApiError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return `Server error: ${error.response.status} - ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    return `Network error: No response from server. Make sure the server is running at ${getApiBaseUrl()}`;
  } else {
    // Something happened in setting up the request that triggered an Error
    return `Request error: ${error.message}`;
  }
};
