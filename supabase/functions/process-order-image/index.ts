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
    console.log('Starting image processing request');
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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

    console.log('Processing image:', imageUrl);

    // Fetch the image data
    let imageResponse;
    try {
      imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Initialize Vision API client
    console.log('Initializing Vision API client');
    let credentials;
    try {
      const credentialsStr = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
      if (!credentialsStr) {
        throw new Error('Google Cloud credentials not found');
      }
      credentials = JSON.parse(credentialsStr);
    } catch (error) {
      console.error('Error parsing Google Cloud credentials:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize Google Cloud Vision API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const client = new ImageAnnotatorClient({
      credentials: credentials,
    });

    console.log('Performing OCR on image');
    // Perform OCR on the image
    let result;
    try {
      [result] = await client.textDetection({
        image: {
          content: new Uint8Array(imageBuffer)
        }
      });
    } catch (error) {
      console.error('Error performing OCR:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to perform OCR on image', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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
    // Looking for alphanumeric strings (at least 4 characters)
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
    console.error('Error processing order image:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process the image. Please try again.',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});