import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
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
      const error = `Failed to fetch image: ${imageResponse.statusText}`;
      console.error(error);
      throw new Error(error);
    }

    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
    console.log('Image fetched successfully, size:', imageBuffer.length);

    // Initialize Vision client with credentials
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    const visionClient = new ImageAnnotatorClient({ credentials });
    console.log('Vision client initialized successfully');

    // Detect text in image
    const [result] = await visionClient.textDetection(imageBuffer);
    const detectedText = result.fullTextAnnotation?.text || '';
    console.log('Text detection completed. Detected text:', detectedText);
    
    if (!detectedText) {
      console.log('No text detected in the image');
      return new Response(
        JSON.stringify({ 
          error: 'No text detected in the image',
          details: 'The OCR service could not find any text in the provided image'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
      );
    }

    // Extract order ID using a simple pattern matching
    // Assuming order IDs are in the format "ORDER-XXXXX" or similar
    const orderIdMatch = detectedText.match(/ORDER[-\s]?(\d+)/i) || 
                        detectedText.match(/\b(OR|O)[-\s]?(\d+)\b/i);
    
    const orderId = orderIdMatch ? orderIdMatch[0] : null;
    console.log('Extracted order ID:', orderId);
    
    if (!orderId) {
      console.log('No order ID pattern found in the detected text');
      return new Response(
        JSON.stringify({ 
          error: 'No order ID pattern found in the detected text',
          detectedText: detectedText,
          details: 'Could not find a pattern matching an order ID in the detected text'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        orderId,
        detectedText,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process order image',
        details: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});