'use client'
import { IEvent } from "@/types";
import Link from "next/link";
import {formatDateTime, getAccessToken} from "@/lib/utils";
import Image from "next/image";
import {useEffect, useState} from "react";
import {DeleteConfirmation} from "@/components/shared/DeleteConfirmation";


type CardProps = {
    event: IEvent,
    hasOrderLink?: boolean,
    hidePrice?: boolean
}

const Card = ({ event, hasOrderLink, hidePrice }: CardProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessToken, setAccessToken]  = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setIsAuthenticated(data.isAuthenticated);
                setUserId(data.userId);
                console.log("Auth status:", data);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, []);

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

    const isEventCreator =  userId === event.organizer?.id;

    return (
        <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
            <Link href={`/events/${event.id}`} style={{background: `url(${event.imageUrl})`}} className="flex items-center flex-grow bg-gray-50 bg-cover bg-center text-gray-500  "></Link>
            {/*  IS EVENT CREATOR ...  */}
            {isEventCreator && !hidePrice && (
                <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
                    <Link href={`/events/${event.id}/update`}>
                        <Image src="/assets/icon/edit.svg" alt="edit" width={20} height={20} />
                    </Link>
                    <DeleteConfirmation id={event.id} accessToken={accessToken}/>
                </div>
            )}
            <div  className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
                {!hidePrice && <div className="flex gap-2">
                    <span className="text-[14px] font-semibold leading-[20px] bg-green-100 px-4 py-1 text-green-600 ">
                        {event.isFree ? 'FREE' : `₦${event.price}`}
                    </span>

                    <p className="text-[14px] font-semibold leading-[20px] w-min rounded-full bg-gray-500/10 px-4 py-1 text-gray-500">
                        {event.category?.name}
                    </p>

                </div>}

                <p className="text-[16px] font-medium leading-[24px] md:text-[18px] md:font-medium md:leading-[28px] text-gray-500">
                    {formatDateTime(event.startDateTime).dateTime}
                </p>

                <Link href={`/events/${event.id}`}>
                    <p className="text-[16px] font-medium leading-[24px] md:text-[20px] md:font-medium md:leading-[30px] line-clamp-2 flex-1 text-black">{event.title}</p>
                </Link>


                <div className="flex justify-between items-center w-full">
                    <Link href={`/profile/${event.organizer?.id}`} className="cursor-pointer" >
                        <p className="text-[14px] font-medium leading-[20px] md:text-[16px] md:font-medium md:leading-[24px] text-gray-600">
                            {event.organizer?.username || 'Unknown Organizer'}
                        </p>
                    </Link>

                    {hasOrderLink && (
                        <Link href={`/orders?eventId=${event.id}`} className="flex gap-2">
                            <p className="text-blue-500">Order Details</p>
                            <Image src="/assets/icon/arrow.svg"  alt="search" width={10} height={10} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
export default Card
