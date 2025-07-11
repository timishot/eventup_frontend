'use client'

import EventForm from "@/components/shared/EventForm"
import { GetEventById } from "@/lib/actions/get/event";
import { getAccessToken } from "@/lib/utils";
import { use, useEffect, useState } from "react";
import { IEvent } from "@/types";

type UpdateEventProps = {
    params: Promise<{
        id: string
    }>
}

const UpdateEvent = ({ params }: UpdateEventProps) => {
    const { id } = use(params);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [event, setEvent] = useState<IEvent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setIsAuthenticated(data.isAuthenticated);
                setUserId(data.userId);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const tokenRes = await getAccessToken();
                const token = tokenRes?.accessToken;
                if (!token) throw new Error("No access token found");
                setAccessToken(token);
                const eventData = await GetEventById(id);
                setEvent(eventData);
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) return <p className="wrapper">Loading event...</p>;
    if (!event) return <p className="wrapper">Failed to load event.</p>;

    return (
        <>
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <h3 className="wrapper h3-bold text-center sm:text-left">Update Event</h3>
            </section>

            <div className="wrapper my-8">
                <EventForm
                    type="Update"
                    event={event}
                    eventId={event.id}
                    userId={userId}
                />
            </div>
        </>
    );
}

export default UpdateEvent;