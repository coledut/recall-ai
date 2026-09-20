import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config error' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json or csv

    // Fetch all user data
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id);

    const { data: people } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', user.id);

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (format === 'csv') {
      // Convert to CSV
      let csv = 'ID,Title,Content,Source,Priority,Status,DueDate,CreatedAt\n';
      (memories || []).forEach((m) => {
        csv += `"${m.id}","${m.title?.replace(/"/g, '""') || ''}","${m.content?.replace(/"/g, '""')?.substring(0, 100) || ''}","${m.source}","${m.priority}","${m.status}","${m.due_date || ''}","${m.created_at}"\n`;
      });

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="recall-ai-backup.csv"',
        },
      });
    }

    // JSON format
    const backup = {
      exportDate: new Date().toISOString(),
      userEmail: user.email,
      data: {
        memories: memories || [],
        people: people || [],
        settings,
      },
      stats: {
        totalMemories: (memories || []).length,
        totalPeople: (people || []).length,
      },
    };

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="recall-ai-backup.json"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Export failed' }, { status: 500 });
  }
}
