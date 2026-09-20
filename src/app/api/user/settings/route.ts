import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return Response.json({ error: 'Missing auth token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch or create default settings
    let { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!settings && error?.code === 'PGRST116') {
      // No settings found, create defaults
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: user.id,
            email_daily_brief: true,
            daily_brief_time: '08:00',
            daily_brief_frequency: 'daily',
            timezone: 'UTC',
            notifications_enabled: true,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create settings:', insertError);
        return Response.json({ error: 'Failed to create settings' }, { status: 500 });
      }
      settings = newSettings;
    } else if (error) {
      console.error('Failed to fetch settings:', error);
      return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return Response.json({ success: true, settings });
  } catch (error) {
    console.error('Settings error:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return Response.json({ error: 'Missing auth token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();

    // Validate updates
    const validFields = [
      'email_daily_brief',
      'daily_brief_time',
      'daily_brief_frequency',
      'timezone',
      'quiet_hours_enabled',
      'quiet_hours_start',
      'quiet_hours_end',
      'notifications_enabled',
    ];

    const sanitizedUpdate = Object.keys(updateData)
      .filter(key => validFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(sanitizedUpdate)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update settings:', error);
      return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return Response.json({ success: true, settings });
  } catch (error) {
    console.error('Settings update error:', error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
