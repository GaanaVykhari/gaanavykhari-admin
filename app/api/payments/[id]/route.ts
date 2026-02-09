import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('payments')
      .select('*, students!inner(id, name, email, phone)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment fetched successfully',
      data,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('payments')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to update payment',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment updated successfully',
      data,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('payments').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Failed to delete payment',
          error: error.message,
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment deleted successfully',
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
