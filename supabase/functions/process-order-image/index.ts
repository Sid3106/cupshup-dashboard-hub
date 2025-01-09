import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractOrderId } from "./order-processor.ts";
import { ImageAnnotatorClient } from "https://esm.sh/@google-cloud/vision@4.0.2";

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

    // Fetch image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('Image fetched successfully');

    // Initialize Vision client with credentials
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    const visionClient = new ImageAnnotatorClient({ credentials });

    // Detect text in image
    const [result] = await visionClient.textDetection({
      image: {
        content: new Uint8Array(imageBuffer)
      }
    });

    const detectedText = result.fullTextAnnotation?.text || '';
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

    // Extract order ID from the detected text
    const orderId = extractOrderId(detectedText);
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