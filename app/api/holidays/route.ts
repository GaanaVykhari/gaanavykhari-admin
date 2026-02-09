import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Holiday } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('from_date', { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch holidays',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Holidays fetched successfully',
      data: data || [],
    } satisfies ApiResponse<Holiday[]>);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { from_date, to_date, description } = body;

    if (!from_date || !to_date) {
      return NextResponse.json(
        {
          ok: false,
          message: 'From date and to date are required',
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Create the holiday
    const { data: holiday, error } = await supabase
      .from('holidays')
      .insert({ from_date, to_date, description: description || null })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to create holiday',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Cancel overlapping sessions
    await supabase
      .from('sessions')
      .update({
        status: 'canceled',
        canceled_reason: description || 'Holiday',
      })
      .eq('status', 'scheduled')
      .gte('date', from_date)
      .lte('date', to_date);

    return NextResponse.json(
      {
        ok: true,
        message: 'Holiday created successfully',
        data: holiday,
      } satisfies ApiResponse<Holiday>,
      { status: 201 }
    );
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
