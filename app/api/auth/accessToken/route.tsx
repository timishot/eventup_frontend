import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('session_access_token')?.value;

    return NextResponse.json({
        accessToken: accessToken || null,
    });
}