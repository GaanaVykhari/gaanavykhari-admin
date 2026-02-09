import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, PaginatedData, Student } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const activeOnly = searchParams.get('active') === 'true';
    const offset = (page - 1) * limit;

    let query = supabase.from('students').select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch students',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Students fetched successfully',
      data: {
        rows: data || [],
        total: count || 0,
        page,
        limit,
      },
    } satisfies ApiResponse<PaginatedData<Student>>);
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

    const {
      name,
      email,
      phone,
      fee_per_classes,
      fee_amount,
      schedule_frequency,
      schedule_days_of_week,
      schedule_days_of_month,
      schedule_time,
      induction_date,
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Name, email, and phone are required',
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        name,
        email,
        phone,
        fee_per_classes: fee_per_classes || 1,
        fee_amount: fee_amount || 0,
        schedule_frequency: schedule_frequency || 'weekly',
        schedule_days_of_week: schedule_days_of_week || [],
        schedule_days_of_month: schedule_days_of_month || [],
        schedule_time: schedule_time || '09:00',
        induction_date:
          induction_date || new Date().toISOString().split('T')[0],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to create student',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Student created successfully',
        data,
      } satisfies ApiResponse<Student>,
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
