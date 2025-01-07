import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    console.log('Processing image:', imageUrl)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract the order ID from this image. Return only the order ID number, nothing else.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error response:', errorText)
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI API response:', data)
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data)
      throw new Error('Invalid response from OpenAI API')
    }

    const orderId = data.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ orderId }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error processing order image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})