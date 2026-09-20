import { createClient } from '@supabase/supabase-js';

export async function verifyApiKey(apiKey: string) {
  try {
    if (!apiKey || !apiKey.startsWith('recall_')) {
      return { valid: false, team: null };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { valid: false, team: null };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: team, error } = await supabase
      .from('teams')
      .select('id, owner_id, plan, max_api_calls_monthly')
      .eq('api_key', apiKey)
      .single();

    if (error || !team) {
      return { valid: false, team: null };
    }

    return { valid: true, team };
  } catch (error) {
    console.error('API key verification error:', error);
    return { valid: false, team: null };
  }
}

export async function recordApiUsage(teamId: string, endpoint: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const month = new Date().toISOString().substring(0, 7);

    await supabase.from('api_usage').insert([
      {
        team_id: teamId,
        endpoint,
        calls_count: 1,
        month,
      },
    ]);
  } catch (error) {
    console.error('Usage tracking error:', error);
  }
}

export function createApiResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}

export function createApiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}
