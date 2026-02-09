import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let query = supabase
      .from('sessions')
      .select('*, students!inner(id, name, email, phone)')
      .order('date', { ascending: false })
      .limit(limit);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch sessions',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Sessions fetched successfully',
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { student_id, date, time, status, notes } = body;

    if (!student_id || !date) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Student ID and date are required',
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        student_id,
        date,
        time: time || '09:00',
        status: status || 'scheduled',
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to create session',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Session created successfully',
        data,
      } satisfies ApiResponse,
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
