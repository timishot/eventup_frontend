
export async function GetEventById(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}/event/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store', // ✅ prevents caching in SSR
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to fetch event");
        }

        return res.json();
    } catch (error) {
        console.error("GetEventById error:", error);
        return null;
    }
}

export async function deleteEvent({ id, path, accessToken }: { id: string; path: string; accessToken: string | null }) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}/`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Failed to delete event.");
        }

        // Optionally redirect or refresh
        if (typeof window !== "undefined") {
            window.location.href = path;
        }

    } catch (error) {
        console.error("deleteEvent error:", error);
        throw error;
    }
}

