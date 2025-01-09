import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  name: string
  email: string
  phone_number: string
  role: string
  city: string
  brand_name?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const inviteData: InviteRequest = await req.json()
    console.log('Received invite request:', inviteData)

    // First, check if the user already exists in auth.users
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error checking existing users:', usersError)
      throw usersError
    }

    const existingUser = users.find(u => u.email === inviteData.email)
    
    if (existingUser) {
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

    // Generate a signup link with the profile data embedded in the redirect URL
    const { data: { user }, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
      inviteData.email,
      {
        data: {
          name: inviteData.name,
          phone_number: inviteData.phone_number,
          role: inviteData.role,
          city: inviteData.city,
          brand_name: inviteData.brand_name
        }
      }
    )

    if (inviteError) {
      console.error('Error inviting user:', inviteError)
      throw inviteError
    }

    if (!user?.identities?.[0]?.identity_data?.invite_link) {
      throw new Error('No invite link generated')
    }

    // Send the invitation email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    await resend.emails.send({
      from: 'CupShup <no-reply@cupshup.co.in>',
      to: inviteData.email,
      subject: 'Welcome to CupShup',
      html: `
        <h2>Welcome to CupShup!</h2>
        <p>Hello ${inviteData.name},</p>
        <p>You've been invited to join CupShup. Click the button below to accept your invitation and set up your account:</p>
        <a href="${user.identities[0].identity_data.invite_link}" 
           style="background-color: #00A979; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
          Accept the Invite
        </a>
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The CupShup Team</p>
      `
    })

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})