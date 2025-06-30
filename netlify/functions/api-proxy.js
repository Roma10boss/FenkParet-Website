exports.handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
  // Extract the API path from the request
  const apiPath = path.replace('/.netlify/functions/api-proxy', '');
  const backendUrl = `https://fenkparet-backend.onrender.com${apiPath}`;
  
  try {
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.authorization || '',
      },
      body: httpMethod !== 'GET' ? body : undefined,
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Proxy error', message: error.message }),
    };
  }
};