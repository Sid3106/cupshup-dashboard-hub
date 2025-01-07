import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { createVisionClient, detectText } from "./vision-client.ts";
import { extractOrderId } from "./order-processor.ts";

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
    // Validate request
    const { imageUrl } = await req.json();
    if (!imageUrl) {
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

    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
    console.log('Image fetched successfully, size:', imageBuffer.length);

    // Initialize Vision client
    const visionClient = await createVisionClient();
    console.log('Vision client initialized successfully');

    // Detect text in image
    const detectedText = await detectText(visionClient, imageBuffer);
    if (!detectedText) {
      return new Response(
        JSON.stringify({ error: 'No text detected in the image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
      );
    }

    // Extract order ID
    const orderId = extractOrderId(detectedText);
    if (!orderId) {
      return new Response(
        JSON.stringify({ 
          error: 'No order ID pattern found in the detected text',
          detectedText: detectedText // Include detected text for debugging
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
      );
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('test')
      .insert({
        order_image: imageUrl,
        order_id: orderId,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save to database');
    }

    return new Response(
      JSON.stringify({ 
        orderId,
        detectedText // Include full text for verification
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});