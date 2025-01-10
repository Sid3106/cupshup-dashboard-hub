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
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error('Missing required environment variables')
      throw new Error('Server configuration error')
    }

    console.log('Initializing Supabase admin client...')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const inviteData: InviteRequest = await req.json()
    console.log('Processing invite request for:', inviteData.email)

    // Validate required fields
    if (!inviteData.email || !inviteData.name || !inviteData.phone_number || !inviteData.role || !inviteData.city) {
      throw new Error('Missing required fields')
    }

    // First, insert into profiles table
    console.log('Creating profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        name: inviteData.name,
        role: inviteData.role,
        phone_number: inviteData.phone_number,
        city: inviteData.city,
        email_id: inviteData.email
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      throw profileError
    }

    // If role is Vendor, insert into vendors table
    if (inviteData.role === 'Vendor') {
      console.log('Creating vendor record...')
      const { error: vendorError } = await supabaseAdmin
        .from('vendors')
        .insert({
          vendor_name: inviteData.name,
          vendor_email: inviteData.email,
          vendor_phone: inviteData.phone_number,
          city: inviteData.city
        })

      if (vendorError) {
        console.error('Error creating vendor:', vendorError)
        throw vendorError
      }
    }

    // Generate sign-in link
    console.log('Generating sign-in link...')
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: inviteData.email,
    })

    if (signInError) {
      console.error('Error generating sign-in link:', signInError)
      throw signInError
    }

    // Send invitation email
    const resend = new Resend(resendApiKey)
    
    console.log('Sending invitation email...')
    const emailResponse = await resend.emails.send({
      from: 'CupShup <no-reply@cupshup.co.in>',
      to: inviteData.email,
      subject: 'Welcome to CupShup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00A979;">Welcome to CupShup!</h2>
          <p>Hello ${inviteData.name},</p>
          <p>You've been invited to join CupShup as a ${inviteData.role}. Click the link below to sign in to your account:</p>
          <p><a href="${signInData.properties?.action_link}" style="background-color: #00A979; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${signInData.properties?.action_link}</p>
          <p>This link will expire in 24 hours.</p>
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