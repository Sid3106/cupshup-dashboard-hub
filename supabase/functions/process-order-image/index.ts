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
    // Log request details for debugging
    console.log('Processing request:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });

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
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Initialize Vision API client
    console.log('Initializing Vision API client');
    
    const credentialsStr = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    if (!credentialsStr) {
      console.error('Google Cloud credentials environment variable not found');
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

    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      console.error('Invalid Google Cloud credentials structure');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Google Cloud credentials',
          details: 'Credentials missing required fields'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const client = new ImageAnnotatorClient({
      credentials: credentials,
    });

    console.log('Performing OCR on image');
    // Perform OCR on the image
    const [result] = await client.textDetection({
      image: {
        content: new Uint8Array(imageBuffer)
      }
    });

    const detections = result.textAnnotations;
    console.log('Raw OCR result:', detections?.[0]?.description);

    if (!detections || detections.length === 0) {
      console.log('No text detected in image');
      return new Response(
        JSON.stringify({ 
          error: 'Could not detect any text in the image. Please ensure the image contains clear, readable text.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        }
      );
    }

    // Extract order ID using regex pattern
    const text = detections[0].description;
    const orderIdMatch = text.match(/[A-Z0-9]{4,}/i);

    if (!orderIdMatch) {
      console.log('No order ID pattern found in text');
      return new Response(
        JSON.stringify({ 
          error: 'Could not detect an order ID in the image. Please ensure the image contains clear, readable text.' 
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
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process the request',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});