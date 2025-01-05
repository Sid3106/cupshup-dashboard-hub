import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user's token and get their data
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Check if user has CupShup role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'CupShup') {
      throw new Error('Unauthorized: Requires CupShup role')
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError

    // Get all user emails from auth.users
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers()
    if (usersError) throw usersError

    // Combine profile data with user emails
    const usersWithEmail = profiles.map((profile) => ({
      ...profile,
      email: users.find(user => user.id === profile.user_id)?.email || '',
    }))

    return new Response(
      JSON.stringify(usersWithEmail),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Unauthorized') ? 403 : 400,
      },
    )
  }
})