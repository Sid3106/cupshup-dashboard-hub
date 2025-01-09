import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Starting order image processing');
    
    // Validate request
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      console.error('No image URL provided');
      return new Response(
        JSON.stringify({ error: 'No image URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing image URL:', imageUrl);

    // Get credentials from environment
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    
    // Prepare the request to Google Cloud Vision API
    const visionRequest = {
      requests: [{
        image: {
          source: {
            imageUri: imageUrl
          }
        },
        features: [{
          type: 'TEXT_DETECTION'
        }]
      }]
    };

    // Call Google Cloud Vision API directly
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${credentials.api_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionRequest)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Vision API error:', error);
      throw new Error(`Vision API error: ${error}`);
    }

    const result = await response.json();
    const detectedText = result.responses[0]?.fullTextAnnotation?.text || '';
    console.log('Detected text:', detectedText);

    if (!detectedText) {
      return new Response(
        JSON.stringify({ 
          error: 'No text detected in the image',
          details: 'The OCR service could not find any text in the provided image'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
      );
    }

    // Extract order ID using simple pattern matching
    // You can modify this based on your order ID format
    const orderIdMatch = detectedText.match(/Order[:\s]+([A-Z0-9]+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    console.log('Extracted order ID:', orderId);

    return new Response(
      JSON.stringify({ 
        success: true,
        orderId,
        detectedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process order image',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});