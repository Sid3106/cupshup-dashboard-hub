const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatPrivateKey(key: string): string {
  // Remove any existing header and footer
  let formattedKey = key.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  // Add header and footer back with proper formatting
  formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
  return formattedKey;
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function createVisionClient() {
  try {
    const credentialsStr = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    if (!credentialsStr) {
      throw new Error('Google Cloud credentials not found in environment');
    }

    const credentials = JSON.parse(credentialsStr);
    console.log('Parsed credentials successfully');
    
    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      throw new Error('Invalid Google Cloud credentials format');
    }

    // Format the private key properly
    credentials.private_key = formatPrivateKey(credentials.private_key);
    return credentials;
  } catch (error) {
    console.error('Error creating Vision client:', error);
    throw new Error(`Failed to initialize Vision client: ${error.message}`);
  }
}

export async function detectText(credentials: any, imageBuffer: Uint8Array) {
  try {
    console.log('Starting text detection with buffer size:', imageBuffer.length);
    
    // Create JWT token for authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: 'RS256', typ: 'JWT' };
    const jwtClaimSet = {
      iss: credentials.client_email,
      sub: credentials.client_email,
      aud: 'https://vision.googleapis.com/',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform'
    };

    // Encode JWT parts
    const headerB64 = base64UrlEncode(JSON.stringify(jwtHeader));
    const claimB64 = base64UrlEncode(JSON.stringify(jwtClaimSet));
    const signInput = `${headerB64}.${claimB64}`;

    // Convert private key to proper format for crypto.subtle
    const binaryKey = new TextEncoder().encode(credentials.private_key);
    const importedKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' }
      },
      false,
      ['sign']
    );

    // Sign the JWT
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      importedKey,
      new TextEncoder().encode(signInput)
    );

    const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
    const jwt = `${signInput}.${signatureB64}`;

    // Prepare request to Vision API
    const base64Image = btoa(String.fromCharCode(...imageBuffer));
    const visionRequest = {
      requests: [{
        image: {
          content: base64Image
        },
        features: [{
          type: 'TEXT_DETECTION'
        }]
      }]
    };

    console.log('Making request to Vision API...');
    
    // Make request to Vision API
    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionRequest)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error response:', errorText);
      throw new Error(`Vision API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Vision API response received');

    if (!result.responses?.[0]?.textAnnotations?.length) {
      console.log('No text detected in image');
      return null;
    }

    const text = result.responses[0].textAnnotations[0].description;
    console.log('Extracted text:', text);
    return text;
  } catch (error) {
    console.error('Error detecting text:', error);
    throw new Error(`Text detection failed: ${error.message}`);
  }
}