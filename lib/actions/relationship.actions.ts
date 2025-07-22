'use client';

import { IRelationship } from '@/types';

interface FollowResponse {
    data: IRelationship[];
    meta?: { total: number; totalPages: number };
}

export const followUser = async ({
                                     userId,
                                     accessToken,
                                 }: {
    userId: string;
    accessToken: string;
}): Promise<FollowResponse> => {
    console.log('Sending follow request with payload:', { followee_id: userId });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relationship/${userId}/follow/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ followee_id: userId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Follow request failed:', errorData);
        throw new Error(`Failed to follow user: ${errorData.detail || 'Unknown error'}`);
    }

    return response.json();
};

export const unfollowUser = async ({
                                       userId,
                                       accessToken,
                                   }: {
    userId: string;
    accessToken: string;
}): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relationship/${userId}/follow/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ followee_id: userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to unfollow user');
    }
};

export const getFollowers = async ({
                                       userId,
                                       page = 1,
                                       limit = 10,
                                   }: {
    userId: string;
    page?: number;
    limit?: number;
}): Promise<FollowResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relationship/${userId}/followers/?page=${page}&limit=${limit}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch followers');
    }

    return response.json();
};

export const getFollowing = async ({
                                       userId,
                                       page = 1,
                                       limit = 10,
                                   }: {
    userId: string;
    page?: number;
    limit?: number;
}): Promise<FollowResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relationship/${userId}/following/?page=${page}&limit=${limit}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch following');
    }

    return response.json();
};

export const checkFollowStatus = async ({
                                            userId,
                                            accessToken,
                                            currentUserId,
                                        }: {
    userId: string | null;
    accessToken: string;
    currentUserId: string;
}): Promise<boolean> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relationship/${userId}/followers/?page=1&limit=10`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to check follow status');
    }

    const data = await response.json();
    return data.data.some((relationship: IRelationship) => relationship.follower.id === currentUserId);
};