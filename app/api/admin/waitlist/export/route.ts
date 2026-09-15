import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')?.trim() ?? '';

  let query = supabase
    .from('waitlist_signups')
    .select('email, created_at')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }

  return NextResponse.json({ rows: data });
}