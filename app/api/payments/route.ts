import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, PaginatedData, Payment } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const studentId = searchParams.get('studentId');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('payments')
      .select('*, students!inner(id, name, email, phone)', { count: 'exact' });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('students.name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('due_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to fetch payments',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payments fetched successfully',
      data: {
        rows: data || [],
        total: count || 0,
        page,
        limit,
      },
    } satisfies ApiResponse<PaginatedData<Payment>>);
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

    const { student_id, amount, due_date, payment_method, notes } = body;

    if (!student_id || !amount || !due_date) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Student ID, amount, and due date are required',
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id,
        amount,
        due_date,
        status: 'pending',
        payment_method: payment_method || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to create payment',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Payment created successfully',
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
