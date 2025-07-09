'use client'
import {CreateEventParams, GetAllEventsParams} from "@/types";

export async function CreateEvent({accessToken, event, path }: CreateEventParams) {

    try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
                ...event,
            }),
        });


        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to create event");
        }

        const newEvent = await response.json();
        return newEvent;
    } catch (error) {
        console.error("CreateEvent error:", error);
        return null;
    }
}

export async function getAllEvents({accessToken, query, limit = 6, page, category  }: GetAllEventsParams) {
    try {
        const searchParams = new URLSearchParams({
            query,
            category,
            limit: limit.toString(),
            skip: ((page - 1) * limit).toString(),
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to fetch events");
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("getAllEvents error:", error);
        return { data: [], meta: { total: 0, totalPages: 0 } };
    }
}

