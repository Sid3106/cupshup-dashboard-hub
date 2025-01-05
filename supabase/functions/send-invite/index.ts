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

    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', (await supabaseClient.auth.admin.listUsers()).data.users.find(u => u.email === inviteData.email)?.id)
      .maybeSingle()

    if (searchError) {
      console.error('Error searching for existing user:', searchError)
      throw searchError
    }

    if (existingUsers) {
      return new Response(
        JSON.stringify({ 
          error: "This email is already associated with an account. The user already has access to the platform." 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

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
          console.log('Sending welcome email to:', inviteData.email)
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
            const errorText = await emailResponse.text();
            console.error('Resend API error:', errorText);
            throw new Error(`Failed to send email: ${errorText}`);
          }

          const emailResult = await emailResponse.json();
          console.log('Email sent successfully:', emailResult);
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // We don't throw here to avoid failing the whole invitation process
          // The user will still be invited, just without the welcome email
        }
      } else {
        console.warn('RESEND_API_KEY not configured');
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