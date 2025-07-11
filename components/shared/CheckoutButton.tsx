'use client'
import {IEvent} from "@/types";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Checkout from "@/components/shared/Checkout";

const CheckoutButton = ({ event }: {event: IEvent}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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
    const hasEventFinished = new Date(event.endDateTime) < new Date();
    return (
        <div className={"flex items-center gap-3"}>
            {/* cannot buy past event   */}
            {hasEventFinished ? (
                <p className={"p-2 text-red-400 "}>Sorry, tickets are no longer available.</p>
            ): (
                <>
                    {/* if user is not authenticated */}
                    {!isAuthenticated ? (
                        <Button asChild className={"rounded-full h-[54px] text-[16px] font-normal leading-[24px] bg-blue-500"} size="lg">
                            <Link href="/login">Get Tickets</Link>
                        </Button>
                    ) : <Checkout event={event} userId={userId} />}



                </>
            )}
        </div>
    )
}
export default CheckoutButton
