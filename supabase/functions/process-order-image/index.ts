import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createWorker } from 'https://esm.sh/tesseract.js@5.0.3';

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
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    console.log('Processing image:', imageUrl);

    // Fetch the image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Initialize Tesseract worker
    const worker = await createWorker();
    
    try {
      // Convert image to blob
      const imageBlob = await imageResponse.blob();
      
      // Initialize worker with English language
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Set parameters for better text recognition
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-', // Limit to alphanumeric and hyphen
        preserve_interword_spaces: '1',
      });
      
      console.log('Starting OCR processing...');
      
      // Perform OCR on the image
      const { data: { text } } = await worker.recognize(imageBlob);
      
      console.log('Raw OCR result:', text);
      
      // Clean up worker
      await worker.terminate();
      
      // Extract order ID using regex pattern
      // Looking for alphanumeric strings (at least 4 characters)
      const orderIdMatch = text.match(/[A-Z0-9]{4,}/i);
      
      if (!orderIdMatch) {
        console.log('No order ID found in text');
        return new Response(
          JSON.stringify({ error: 'Could not detect an order ID in the image. Please ensure the image contains clear, readable text.' }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            },
            status: 422
          }
        );
      }
      
      const orderId = orderIdMatch[0];
      console.log('Extracted Order ID:', orderId);

      return new Response(
        JSON.stringify({ orderId }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } finally {
      // Ensure worker is terminated even if an error occurs
      if (worker) {
        await worker.terminate();
      }
    }
  } catch (error) {
    console.error('Error processing order image:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process the image. Please ensure the image is clear and contains readable text.',
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});