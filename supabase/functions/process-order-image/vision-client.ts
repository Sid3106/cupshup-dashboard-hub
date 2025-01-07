const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to format private key by removing headers and line breaks
function formatPrivateKey(privateKey: string): string {
  return privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')
    .trim();
}

// Function to decode base64 to array buffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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

    console.log('Credentials validated successfully');
    return credentials;
  } catch (error) {
    console.error('Error creating Vision client:', error);
    throw new Error(`Failed to initialize Vision client: ${error.message}`);
  }
}

export async function detectText(credentials: any, imageBuffer: Uint8Array): Promise<string | null> {
  try {
    console.log('Starting text detection with buffer size:', imageBuffer.length);
    
    // Create JWT token for authentication
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: credentials.client_email,
      sub: credentials.client_email,
      aud: 'https://vision.googleapis.com/',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform'
    };

    // Encode JWT parts
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signInput = `${encodedHeader}.${encodedPayload}`;

    console.log('Preparing to sign JWT...');

    try {
      // Format and prepare the private key
      const formattedKey = formatPrivateKey(credentials.private_key);
      const keyData = base64ToArrayBuffer(formattedKey);

      // Import the private key
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        keyData,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: 'SHA-256' }
        },
        false,
        ['sign']
      );

      console.log('Key imported successfully');

      // Sign the JWT
      const signature = await crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        privateKey,
        new TextEncoder().encode(signInput)
      );

      console.log('JWT signed successfully');

      const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
      const jwt = `${signInput}.${encodedSignature}`;

      // Prepare Vision API request
      const base64Image = btoa(String.fromCharCode(...imageBuffer));
      const requestBody = {
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
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
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vision API error response:', errorText);
        throw new Error(`Vision API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Vision API response received successfully');

      if (!result.responses?.[0]?.textAnnotations?.length) {
        console.log('No text detected in image');
        return null;
      }

      const text = result.responses[0].textAnnotations[0].description;
      console.log('Extracted text:', text);
      return text;

    } catch (error) {
      console.error('Error during JWT signing or API request:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error detecting text:', error);
    throw new Error(`Text detection failed: ${error.message}`);
  }
}