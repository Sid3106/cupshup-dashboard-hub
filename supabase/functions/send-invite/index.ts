import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  name: string;
  email: string;
  phone_number: string;
  role: string;
  city: string;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const inviteData: InviteRequest = await req.json()
    console.log('Received invite request:', inviteData)

    // Create the user invitation
    const { data: authData, error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(inviteData.email)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    if (authData.user) {
      // Create profile for the user
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          role: inviteData.role,
          city: inviteData.city,
          name: inviteData.name,
          phone_number: inviteData.phone_number
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      // Send welcome email via Resend
      if (RESEND_API_KEY) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'CupShup <onboarding@resend.dev>',
              to: [inviteData.email],
              subject: 'Welcome to CupShup!',
              html: `
                <h1>Welcome to CupShup!</h1>
                <p>Hello ${inviteData.name},</p>
                <p>You have been invited to join CupShup as a ${inviteData.role}.</p>
                <p>Please check your email for the invitation link to set up your account.</p>
                <p>Best regards,<br>The CupShup Team</p>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error('Resend API error:', await emailResponse.text())
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError)
        }
      } else {
        console.warn('RESEND_API_KEY not configured')
      }
    }

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-invite function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})