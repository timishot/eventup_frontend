// app/api/auth/set-cookie/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { userId, accessToken, refreshToken } = await req.json();
    const isProduction = process.env.NODE_ENV === 'production';

    const res = NextResponse.json({ message: 'Cookies set' });

    res.cookies.set('session_id', userId, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    res.cookies.set('session_access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 15,
        path: '/',
    });

    res.cookies.set('session_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    });

    return res;
}
