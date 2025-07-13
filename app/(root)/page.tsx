'use client'
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Collection from "@/components/shared/Collection";
import {getAllEvents} from "@/lib/actions/event";
import {useEffect, useState} from "react";
import {getAccessToken} from "@/lib/utils";

export default function Home() {
    const [accessToken, setAccessToken]  = useState<string | null>(null);
    const [events, setEvents] = useState<any>([]);

    useEffect(() => {

        getAccessToken()
            .then(async (data) => {
                console.log('Access Token data T:', data);
                if (!data?.accessToken) return;

                setAccessToken(data.accessToken);
                console.log('Access Token play', data);

                // ✅ Now safe to call fetchData
                const events = await getAllEvents({
                    query: '',
                    category: '',
                    page: 1,
                    limit: 6,
                    accessToken: data.accessToken,
                });

                setEvents(events);
                console.log("this is my event: ",events);
            })
            .catch(error => {
                console.error('Failed to fetch Access Token:', error);
            });
    }, []);
  return (
      <>
          <section className="bg-[#F6F8FD] bg-contain py-5 md-py-10">
              <div
                  className="max-w-7xl  lg:mx-auto p-5 md:px-10 xl:px-0 w-full grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
                  <div className="flex flex-col justify-center gap-8">
                      <h1 className="font-bold text-[40px] leading-[48px] lg:text-[48px] lg:leading-[60px]  xl:text-[58px] xl:leading-[74px]">Events.
                          Made Easy:
                          Smart tools for unforgettable experiences.</h1>
                      <p>Join 3,000+ mentors from top global companies — learn, grow, and thrive with our worldwide
                          community.</p>
                      <Button size="lg" asChild
                              className="w-full rounded-full h-[54px] p-regular-16 sm:w-fit bg-blue-500 text-white transition duration-300 ease-in-out hover:scale-105">
                          <Link href="#events">
                              Explore Now
                          </Link>
                      </Button>
                  </div>

                  <Image src="/assets/images/hero.png" alt="hero" width={1000} height={1000}
                         className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"/>
              </div>
          </section>
          <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
              <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">Trust by <br/> Thousands of Events</h2>
              <div className="flex w-full flex-col gap-5 md:flex-row">
                  <Search />
                  CategoryFilter
              </div>
              <Collection data={events?.data || []} emptyTitle="No Events Found" emptyStateSubtext="Come back later" collectionType="All_Events" limit={6} page={1} totalPages={2}/>
          </section>
      </>
  );
}
