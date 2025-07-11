'use client'

import {use, useEffect, useState} from "react";
import { GetEventById } from "@/lib/actions/get/event";
import Image from "next/image";
import {formatDate} from "date-fns";
import {formatDateTime, getAccessToken} from "@/lib/utils";
import {IEvent, SearchParamProps} from "@/types";
import Collection from "@/components/shared/Collection";
import {getRelatedEvents} from "@/lib/actions/event";
import {useSearchParams} from "next/navigation";
import CheckoutButton from "@/components/shared/CheckoutButton";
import {event} from "next/dist/build/output/log";


type EventDetailsProps = {
    params: Promise<{ id: string }>;
};

const EventDetails = ({ params }: EventDetailsProps) => {
    const { id } = use(params);

    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";

    const [event, setEvent] = useState<IEvent>();
    const [relatedEvents, setRelatedEvents] = useState<any>(null);


    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await GetEventById(id);
                setEvent(data);
            } catch (error) {
                console.error("Failed to fetch event:", error);
            }
        };
        fetchEvent();
    }, [id]);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!event) return;

            try {
                const  category = event.category?.id || ""
                const data = await getRelatedEvents({
                    category: category,
                    eventId: event.id,
                    page,
                    limit: 6
                });
                setRelatedEvents(data);
            } catch (error) {
                console.error("Failed to fetch related events:", error);
            }
        };

        fetchRelated();
    }, [event, page]);

    if (!event) {
        return (
            <section className="flex items-center justify-center h-[50vh]">
                <p className="text-lg font-semibold">Loading event...</p>
            </section>
        );
    }
    console.log(event.imageUrl)
    return (
        <>
            <section className="flex justify-center  bg-primary-50 bg-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
                    <Image src={event.imageUrl} alt="hero Image" width={1000} height={1000}
                           className="h-full min-h-[300px] object-cover object-center"/>
                    <div className="flex w-full flex-col gap-8 p-5 md:p-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">{event.title}</h2>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex gap-3">
                                    <p className="font-bold text-[20px] leading-[30px] tracking-[2%] rounded-full bg-green-500/10 px-5 py-2 text-green-700">{event.isFree ? 'Free' : `₦${event.price}`}</p>
                                    <p className="text-[16px] font-medium leading-[24px] rounded-full bg-gray-500/10 px-4 py-2.5  text-gray-500">{event.category?.name}</p>
                                </div>

                                <p className="text-[18px] font-medium leading-[28px] ml-2 mt-2 sm:mt-0">
                                    by{' '}
                                    <span className="text-blue-500">{event.organizer?.username}</span>
                                </p>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <CheckoutButton event={event}/>

                        <div className="flex flex-col gap-5">
                            <div className="flex gap-2 md:gap-3">
                                <Image src="/assets/icon/calendar.svg" alt="calendar" width={32} height={32}/>
                                <div
                                    className="text-[16px] font-medium leading-[24px] md:text-[20px] md:font-normal md:leading-[30px] md:tracking-[2%] flex flex-wrap items-center gap-3">
                                    <p>{formatDateTime(event.startDateTime).dateOnly} - {' '} {formatDateTime(event.startDateTime).timeOnly} </p>
                                    <p>{formatDateTime(event.endDateTime).dateOnly} - {' '} {formatDateTime(event.endDateTime).timeOnly} </p>
                                </div>
                            </div>

                            <div
                                className="text-[20px] font-normal leading-[30px] tracking-[2%] flex items-center gap-3">
                                <Image src="/assets/icon/location.svg" alt="location" width={32} height={32}/>
                                <p className="text-[16px] font-medium leading-[24px] lg:text-[20px] lg:font-normal lg:leading-[30px] lg:tracking-[2%]">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-[20px] leading-[30px] tracking-[2%] text-gray-600">What You'll
                                Learn:</p>
                            <p className="text-[16px] font-medium leading-[24px] lg:text-[18px] lg:font-normal lg:leading-[28px] lg:tracking-[2%] truncate text-blue-500 ">{event.description}</p>
                            <p className="text-[16px] font-medium leading-[24px] lg:text-[18px] lg:font-normal lg:leading-[28px] lg:tracking-[2%] truncate text-blue-500 underline">{event.url}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Event From the same organizer */}
            <section className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-8 md:gap-12">
                <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">Related Events</h2>
                <Collection data={relatedEvents?.data || []} emptyTitle="No Events Found" emptyStateSubtext="Come back later" collectionType="All_Events" limit={6} page={1} totalPages={2}/>
            </section>
        </>


    )
}
export default EventDetails
