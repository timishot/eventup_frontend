'use client'
import {Button} from "@/components/ui/button";

import Link from "next/link";
import Collection from "@/components/shared/Collection";
import {useEffect, useState} from "react";
import {getAccessToken} from "@/lib/utils";
import {GetEventById} from "@/lib/actions/get/event";
import {IEvent} from "@/types";
import {getEventsByUser} from "@/lib/actions/event";
import {getOrdersByUser} from "@/lib/actions/order.actions";

const ProfilePage = () => {
    const [event, setEvent] = useState<IEvent[]>();
    const [orderEvents, setOrderEvents] = useState<IEvent[]>([]);
    const [accessToken, setAccessToken]  = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        getAccessToken()
            .then(data => {

                setAccessToken(data.accessToken);

                console.log('Access Token', data);
            })
            .catch(error => {
                console.error('Failed to fetch Access Token status:', error);
            });
    }, []);



    useEffect(() => {
        const fetchEventByUser = async () => {
            if (!accessToken) return; // 🔒 don't fetch until token exists

            try {
                const organizedEvents = await getEventsByUser({ accessToken, page: 1 });
                setEvent(organizedEvents.data);
                console.log(event)
            } catch (error) {
                console.error("Failed to fetch event:", error);
            }
        };

        fetchEventByUser();
    }, [accessToken]);

    useEffect(() => {
        const fetchOrderByUser = async () => {
            try {
                if (!userId) return; // 🔒 don't fetch until userId exists
                const orders = await getOrdersByUser({userId, page:1});
                setOrderEvents(orders.data);

                console.log('Orders:', orderEvents);
            }catch (error) {
                console.error("Failed to fetch event:", error);
            }
        }

        fetchOrderByUser();
    }, [accessToken, userId]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setUserId(data.userId);
                console.log("Auth status:", data);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, []);

    console.log(event)



    return (
        <>
            {/* My Tickets   */}
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className={"wrapper flex items-center justify-center sm:justify-between"}>
                    <h3 className={"font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left"}>My
                        Tickets</h3>
                    <Button asChild size="lg"
                            className={"rounded-full h-[54px] text-[16px] font-normal leading-[24px] hidden sm:flex bg-blue-500"}>
                        <Link href="/#events">
                            Explore More Events
                        </Link>
                    </Button>
                </div>
            </section>

            <section className={"wrapper my-8"}>
                <Collection data={orderEvents || []} emptyTitle="No Event tickets purchased yet" emptyStateSubtext="No worries - plenty of exciting events to explore!" collectionType="My_Tickets" limit={3} page={1} urlParamName="ordersPage" totalPages={2}/>
            </section>

            {/* Events Organized   */}
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className={"wrapper flex items-center justify-center sm:justify-between"}>
                    <h3 className={"font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left"}>Events Organized</h3>
                    <Button asChild size="lg"
                            className={"rounded-full h-[54px] text-[16px] font-normal leading-[24px] hidden sm:flex bg-blue-500" }>
                        <Link href="/events/create">
                            Create New Events
                        </Link>
                    </Button>
                </div>
            </section>

            <section className={"wrapper my-8"}>
                <Collection data={event || []} emptyTitle="No events have been created yet" emptyStateSubtext="Go create some now" collectionType="Events_Organized" limit={6} page={1} urlParamName="eventsPage" totalPages={2}/>
            </section>
        </>
    )
}
export default ProfilePage
