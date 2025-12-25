import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackPayload {
  userId?: string;
  type: 'bug' | 'suggestion' | 'praise' | 'other';
  message: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    console.log('Received API key:', apiKey.substring(0, 8) + '...');

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key and get user
    const { data: keyData, error: keyError } = await supabase
      .rpc('get_user_id_from_api_key', { api_key: apiKey });

    console.log('API key lookup result:', { keyData, keyError });

    if (keyError || !keyData || keyData.length === 0) {
      console.log('Invalid API key or lookup error:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, api_key_id } = keyData[0];
    console.log('Found user:', user_id, 'with API key ID:', api_key_id);

    // Parse request body
    const body: FeedbackPayload = await req.json();
    console.log('Received feedback payload:', body);

    // Validate required fields
    if (!body.type || !body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate type
    const validTypes = ['bug', 'suggestion', 'praise', 'other'];
    if (!validTypes.includes(body.type)) {
      return new Response(
        JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message length
    if (body.message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message too long. Maximum 5000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        user_id,
        api_key_id,
        external_user_id: body.userId || null,
        type: body.type,
        message: body.message.trim(),
        metadata: body.metadata || {}
      })
      .select('id, type, message, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Feedback saved successfully:', feedback);

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback: {
          id: feedback.id,
          type: feedback.type,
          message: feedback.message,
          created_at: feedback.created_at
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
