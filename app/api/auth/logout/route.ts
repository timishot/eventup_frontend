import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' });

    // Clear all auth cookies by setting them with past expiry
    response.cookies.set('session_id', '', {
        path: '/',
        expires: new Date(0),
    });

    response.cookies.set('session_access_token', '', {
        path: '/',
        expires: new Date(0),
    });

    response.cookies.set('session_refresh_token', '', {
        path: '/',
        expires: new Date(0),
    });

    return response;
}
