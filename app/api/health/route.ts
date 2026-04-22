import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Healthy',
    timestamp: new Date().toISOString(),
  });
}
