import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createSupabaseServer } from '@/lib/supabaseServer';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

const PAGE_SIZE = 20;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const supabase = await createSupabaseServer();

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { error } = await supabase.from('waitlist_signups').insert({
    email: email.trim().toLowerCase(),
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already on the waitlist' }, { status: 409 });
    }
    console.error('Waitlist insert error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

