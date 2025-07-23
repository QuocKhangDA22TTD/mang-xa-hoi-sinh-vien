// Test CORS connection with multiple endpoints
export const testCorsConnection = async () => {
  const API_BASE_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://daring-embrace-production.up.railway.app';

  console.log('🧪 Testing CORS connection to:', API_BASE_URL);

  // Test simple endpoint first
  try {
    console.log('🔍 Testing simple endpoint...');
    const simpleResponse = await fetch(`${API_BASE_URL}/simple`);
    if (simpleResponse.ok) {
      const simpleData = await simpleResponse.json();
      console.log('✅ Simple endpoint works:', simpleData);
    }
  } catch (error) {
    console.log('❌ Simple endpoint failed:', error.message);
  }

  // Test health endpoint
  try {
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint works:', healthData);
    }
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }

  // Test main API endpoint
  try {
    console.log('🔍 Testing main API endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS test successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ CORS test failed:', response.status, response.statusText);
      return {
        success: false,
        error: `${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
    return { success: false, error: error.message };
  }
};

// Auto-run test when imported
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testCorsConnection();
  }, 1000);
}
