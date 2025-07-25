'use client'
import {
    AllEventsParams,
    CreateEventParams,
    GetAllEventsParams, GetEventsByProfileUserParams,
    GetEventsByUserParams,
    GetRelatedEventsByCategoryParams,
    UpdateEventParams
} from "@/types";

export async function CreateEvent({accessToken, event, path }: CreateEventParams) {
    console.log("Creating event with data:", event, "and accessToken:", accessToken);
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

export async function UpdateEvent({ userId, accessToken, event, path }: UpdateEventParams) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${event.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
                ...event,
                organizer: userId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update event");
        }

        const updatedEvent = await response.json();
        return updatedEvent;
    } catch (error) {
        console.error("UpdateEvent error:", error);
        return null;
    }
}

export async function getRelatedEvents({
                                           category,
                                           eventId,
                                           page = 1,
                                           limit = 3,
                                       }: GetRelatedEventsByCategoryParams) {
    try {

        const searchParams = new URLSearchParams({
            category : category.toString(),
            eventId,
            page: page.toString(),
            limit: limit?.toString(),
        });


        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/related/?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to fetch related events");
        }

        return res.json();
    } catch (error) {
        console.error("getRelatedEvents error:", error);
        return null;
    }
}


export async function getEventsByUser({ accessToken, page = 1, limit = 6 }: GetEventsByUserParams) {
    try {
        const searchParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/organized/?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to fetch organized events");
        }

        return await res.json();
    } catch (error) {
        console.error("getEventsByUser error:", error);
        return { data: [], meta: { total: 0, totalPages: 0 } };
    }
}

export async function getEventsByProfileUser({ userId , page = 1, limit = 6 }: GetEventsByProfileUserParams) {
    try {
        const searchParams = new URLSearchParams({
            UserId: String(userId),
            page: String(page),
            limit: String(limit),
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/profile/event/?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to fetch profileUser events");
        }

        return await res.json();
    } catch (error) {
        console.error("getEventsByUser error:", error);
        return { data: [], meta: { total: 0, totalPages: 0 } };
    }
}

export async function AllEvent({ query, limit = 6, page, category  }: AllEventsParams) {
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

