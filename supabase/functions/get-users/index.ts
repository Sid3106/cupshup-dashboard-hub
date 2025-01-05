import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user's token from the request header
    const authHeader = req.headers.get('Authorization')!
    
    // Verify the user is authenticated and has the CupShup role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError) throw authError

    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    if (profileError) throw profileError
    if (userProfile.role !== 'CupShup') {
      throw new Error('Unauthorized')
    }

    // Fetch all users with their profiles
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
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})