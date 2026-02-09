import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data, error } = await supabase
      .from('notification_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch notifications',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Notifications fetched successfully',
      data: data || [],
    } satisfies ApiResponse);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Internal server error',
        error: String(err),
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
