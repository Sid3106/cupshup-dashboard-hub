import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImageAnnotatorClient } from "npm:@google-cloud/vision@4.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get and validate request body
    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);

    if (!bodyText) {
      throw new Error('Request body is empty');
    }

    let requestBody;
    try {
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const { imageUrl } = requestBody;
    
    if (!imageUrl) {
      console.error('No image URL provided');
      return new Response(
        JSON.stringify({ error: 'No image URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Fetching image from URL:', imageUrl);

    // Fetch the image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get image buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('Image buffer size:', imageBuffer.byteLength);

    // Initialize Vision API client
    console.log('Initializing Vision API client');
    
    const credentialsStr = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    if (!credentialsStr) {
      console.error('Google Cloud credentials not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Google Cloud credentials not configured',
          details: 'Missing GOOGLE_CLOUD_CREDENTIALS environment variable'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsStr);
      console.log('Successfully parsed credentials JSON');
    } catch (error) {
      console.error('Failed to parse Google Cloud credentials:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Google Cloud credentials',
          details: 'Failed to parse credentials JSON'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Validate credentials structure
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in credentials:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Google Cloud credentials',
          details: `Missing required fields: ${missingFields.join(', ')}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    try {
      const client = new ImageAnnotatorClient({
        credentials: credentials,
      });
      console.log('Successfully created Vision API client');

      console.log('Performing OCR on image');
      const [result] = await client.textDetection({
        image: {
          content: new Uint8Array(imageBuffer)
        }
      });

      console.log('Raw OCR result:', result?.textAnnotations?.[0]?.description);

      if (!result?.textAnnotations?.length) {
        console.log('No text detected in image');
        return new Response(
          JSON.stringify({ 
            error: 'No text detected in the image',
            details: 'Please ensure the image contains clear, readable text.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422
          }
        );
      }

      // Extract order ID using regex pattern
      const text = result.textAnnotations[0].description;
      console.log('Extracted text:', text);
      
      const orderIdMatch = text.match(/[A-Z0-9]{4,}/i);
      console.log('Order ID match:', orderIdMatch);

      if (!orderIdMatch) {
        console.log('No order ID pattern found in text');
        return new Response(
          JSON.stringify({ 
            error: 'No order ID found',
            details: 'Could not detect an order ID pattern in the image text.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422
          }
        );
      }

      const orderId = orderIdMatch[0];
      console.log('Successfully extracted Order ID:', orderId);

      return new Response(
        JSON.stringify({ orderId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error using Vision API:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Vision API error',
          details: error.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});