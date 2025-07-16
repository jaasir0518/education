// Simple test script to check if API routes are working
// Run this in browser console or as a separate test file

async function testVideoProgressAPI() {
  try {
    // Test data
    const testData = {
      progress: 30.5,
      duration: 120.0
    };

    console.log('Testing video progress API...');
    console.log('Test data:', testData);

    // Make the API call
    const response = await fetch('/api/videos/test-video-123/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      console.error('API call failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('API call successful!');
    console.log('Result:', result);

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Call the test function
testVideoProgressAPI();
