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

    // Validate required fields
    if (!inviteData.email || !inviteData.name || !inviteData.phone_number || !inviteData.role || !inviteData.city) {
      throw new Error('Missing required fields')
    }

    // Check for existing user
    const { data: existingUser, error: userError } = await supabaseClient.auth.admin.getUserByEmail(inviteData.email)
    
    if (userError && userError.message !== 'User not found') {
      console.error('Error checking existing user:', userError)
      throw new Error(`Failed to check existing user: ${userError.message}`)
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          error: "This email is already associated with an account"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Structure user metadata
    const userMetadata = {
      name: inviteData.name,
      phone_number: inviteData.phone_number,
      role: inviteData.role,
      city: inviteData.city,
      ...(inviteData.brand_name && { brand_name: inviteData.brand_name })
    }

    console.log('Inviting user with metadata:', userMetadata)

    // Generate signup link with metadata
    const { data, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
      inviteData.email,
      {
        data: userMetadata,
        options: {
          data: userMetadata
        }
      }
    )

    if (inviteError) {
      console.error('Error inviting user:', inviteError)
      throw new Error(`Failed to invite user: ${inviteError.message}`)
    }

    if (!data?.user?.identities?.[0]?.identity_data?.invite_link) {
      throw new Error('No invite link generated')
    }

    // Send invitation email
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    const emailResponse = await resend.emails.send({
      from: 'CupShup <no-reply@cupshup.co.in>',
      to: inviteData.email,
      subject: 'Welcome to CupShup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00A979;">Welcome to CupShup!</h2>
          <p>Hello ${inviteData.name},</p>
          <p>You've been invited to join CupShup as a ${inviteData.role}. Click the button below to accept your invitation and set up your account:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${data.user.identities[0].identity_data.invite_link}" 
               style="background-color: #00A979; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
          <p>Best regards,<br>The CupShup Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
        </div>
      `
    })

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error)
      throw new Error(`Failed to send invitation email: ${emailResponse.error.message}`)
    }

    console.log('Invitation sent successfully')
    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        data: {
          email: inviteData.email,
          role: inviteData.role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-invite function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})