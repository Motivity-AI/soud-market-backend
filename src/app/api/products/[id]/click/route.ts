import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  await supabase.rpc('increment_whatsapp_clicks', { pid: params.id });
  return NextResponse.json({ ok: true });
}
