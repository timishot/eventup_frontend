'use server';

import {cookies} from "next/headers";


export async function handleLogin(userId: string, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    // IMPORTANT: AWAIT the cookies() call
    const cookieStore = await cookies();

    // Session ID cookie
    cookieStore.set('session_id', userId, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 7, // 7 days (adjust as needed for session lifetime)
        path: '/',
    });

    // Access Token cookie (consider shorter maxAge if tokens are short-lived)
    cookieStore.set('session_access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        // Assuming access tokens are short-lived, adjust this maxAge to match your token's actual expiration
        maxAge: 60 * 15, // Example: 15 minutes
        path: '/',
    });

    // Refresh Token cookie (typically has a longer maxAge)
    cookieStore.set('session_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 30, // Example: 30 days
        path: '/',
    });

    console.log('User logged in, cookies set.'); // Basic logging
}

export async function clearAuthCookies() {
    // IMPORTANT: AWAIT the cookies() call
    const cookieStore = await cookies();

    // Clear cookies by setting an empty value and an immediate expiry
    cookieStore.set('session_id', '', { expires: new Date(0), path: '/' });
    cookieStore.set('session_access_token', '', { expires: new Date(0), path: '/' });
    cookieStore.set('session_refresh_token', '', { expires: new Date(0), path: '/' });

    // In a real application, you would also call your authentication server
    // here to invalidate the refresh token on the server-side.
    // Example: await authService.invalidateRefreshToken(refreshToken);

    console.log('Auth cookies cleared.'); // Basic logging
}