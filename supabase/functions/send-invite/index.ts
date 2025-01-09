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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const inviteData: InviteRequest = await req.json()
    console.log('Received invite request:', inviteData)

    // Validate required fields
    if (!inviteData.email || !inviteData.name || !inviteData.phone_number || !inviteData.role || !inviteData.city) {
      throw new Error('Missing required fields')
    }

    // Check for existing user
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email_id', inviteData.email)
      .maybeSingle()
    
    if (profileError) {
      console.error('Error checking existing profile:', profileError)
      throw new Error(`Failed to check existing profile: ${profileError.message}`)
    }

    if (existingProfile) {
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

    console.log('Creating user with metadata:', userMetadata)

    // First create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: inviteData.email,
      email_confirm: false,
      user_metadata: userMetadata
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw new Error(`Failed to create user: ${createError.message}`)
    }

    console.log('User created successfully:', userData)

    // Then generate the invitation link
    const { data: inviteData2, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: inviteData.email,
    })

    if (inviteError) {
      console.error('Error generating invite link:', inviteError)
      throw new Error(`Failed to generate invite link: ${inviteError.message}`)
    }

    console.log('Invite link generated successfully')

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
          <p>You've been invited to join CupShup as a ${inviteData.role}. Click the link below to set up your account:</p>
          <p><a href="${inviteData2.properties?.action_link}" style="background-color: #00A979; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${inviteData2.properties?.action_link}</p>
          <p>This invitation link will expire in 24 hours.</p>
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