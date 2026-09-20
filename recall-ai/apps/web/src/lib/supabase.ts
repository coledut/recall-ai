import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@recall/config';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const env = getEnv();
    supabaseClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabaseClient;
};

export const getSupabaseServerClient = async () => {
  // For server-side operations, use service role key (if available)
  // In MVP, we'll use RLS policies + anon key; service role only for admin tasks
  const env = getEnv();
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
};
