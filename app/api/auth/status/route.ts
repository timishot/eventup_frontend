import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const userId = request.cookies.get('session_id')?.value;

    return NextResponse.json({
        isAuthenticated: !!userId,
        userId,
    });
}