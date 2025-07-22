'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Collection from "@/components/shared/Collection";
import { AllEvent } from "@/lib/actions/event";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/utils";
import { IRelationship, IUser, SearchParamProps } from "@/types";
import Search from "@/components/shared/Search";
import { useSearchParams } from "next/navigation";
import CategoryFilter from "@/components/shared/CategoryFilter";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { followUser, getFollowing, unfollowUser } from "@/lib/actions/relationship.actions";

export default function Home() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page") || "1");
    const searchText = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [following, setFollowing] = useState<IUser[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [events, setEvents] = useState<any>([]);

    const fetchData = async () => {
        try {
            const events = await AllEvent({
                query: searchText,
                category,
                page: 1,
                limit: 6,
            });
            setEvents(events);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchText, category]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/status");
                const data = await res.json();
                setUserId(data.userId);
                console.log("Auth status:", data);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };
        checkAuth();
    }, []);

    const fetchSuggestions = async () => {
        if (!accessToken) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/suggestions/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch suggestions");
            }

            const data = await response.json();
            console.log("Raw Suggestions:", data);
            const followedIds = following.map((f) => f.id);
            const filteredSuggestions = data.data.filter((suggestion: any) => !followedIds.includes(suggestion.id));
            setSuggestions(filteredSuggestions);
        } catch (error) {
            console.error("Profile fetchSuggestions error:", error);
        }
    };

    useEffect(() => {
        getAccessToken()
            .then((data) => {
                setAccessToken(data.accessToken);
                console.log("Access Token:", data);
            })
            .catch((error) => {
                console.error("Failed to fetch Access Token status:", error);
            });
    }, []);

    const handleFollow = async (suggestionId: string) => {
        if (!accessToken || !userId || !suggestionId) return;

        try {
            const isFollowing = following.some((user) => user.id === suggestionId);
            if (isFollowing) {
                await unfollowUser({ userId: suggestionId, accessToken });
            } else {
                await followUser({ userId: suggestionId, accessToken });
            }

            // Refresh following list and suggestions
            const response = await getFollowing({ userId: userId as string, page, limit: 10 });
            const followingUsers = response.data.map((rel: IRelationship) => rel.followee);
            setFollowing(followingUsers);
            fetchSuggestions();
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        }
    };

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!userId) return;

            try {
                const response = await getFollowing({ userId: userId as string, page, limit: 10 });
                console.log("Following response:", response);
                const followingUsers = response.data.map((rel: IRelationship) => rel.followee);
                setFollowing(followingUsers);
            } catch (error) {
                console.error("Failed to fetch following:", error);
            }
        };
        fetchFollowing();
    }, [userId, page, accessToken]);

    useEffect(() => {
        if (accessToken && userId) {
            fetchSuggestions();
        }
    }, [accessToken, userId, following]);

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: Math.min(3, suggestions.length),
        slidesToScroll: 3,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: Math.min(2, suggestions.length) } },
            { breakpoint: 640, settings: { slidesToShow: Math.min(1, suggestions.length) } },
        ],
    };

    return (
        <>
            <section className="bg-[#F6F8FD] bg-contain py-5 md:py-10">
                <div className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
                    <div className="flex flex-col justify-center gap-8">
                        <h1 className="font-bold text-[40px] leading-[48px] lg:text-[48px] lg:leading-[60px] xl:text-[58px] xl:leading-[74px]">
                            Events. Made Easy: Smart tools for unforgettable experiences.
                        </h1>
                        <p>Join 3,000+ mentors from top global companies — learn, grow, and thrive with our worldwide community.</p>
                        <Button
                            size="lg"
                            asChild
                            className="w-full rounded-full h-[54px] p-regular-16 sm:w-fit bg-blue-500 text-white transition duration-300 ease-in-out hover:scale-105"
                        >
                            <Link href="#events">Explore Now</Link>
                        </Button>
                    </div>
                    <Image
                        src="/assets/images/hero.png"
                        alt="hero"
                        width={1000}
                        height={1000}
                        className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
                    />
                </div>
            </section>
            <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
                <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">
                    Trust by <br /> Thousands of Events
                </h2>
                <div className="flex w-full flex-col gap-5 md:flex-row">
                    <Search />
                    <CategoryFilter />
                </div>
                <Collection
                    data={events?.data || []}
                    emptyTitle="No Events Found"
                    emptyStateSubtext="Come back later"
                    collectionType="All_Events"
                    limit={6}
                    page={page}
                    totalPages={events?.totalPages}
                />
            </section>
            {suggestions.length > 0 && accessToken && (
                <div className="wrapper mt-8 w-full  mb-8">
                    <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px] mb-10">
                        People You May Know
                    </h2>
                    <div className="slider-container">
                        <Slider {...sliderSettings} className="flex w-full " >
                            {suggestions.map((suggestion) => {
                                const isFollowing = following.some((user) => user.id === suggestion.id);
                                return (
                                    <div key={suggestion.id} className="tinj">
                                        <div className="group relative flex justify-between min-h-[380px] max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[338px] px-10 pt-10">
                                            <div>
                                                <h3 className="font-bold text-2xl mb-1.5">{suggestion.name || suggestion.username}</h3>
                                                <p className="text-[16px] text-gray-500">{suggestion.profession || "No profession"}</p>
                                                <p className="text-sm"><span className="font-semibold">Interests:</span> {" "} {suggestion.interests.join(", ") || "None"}</p>
                                                <p className="text-sm">Similarity: {(suggestion.similarity * 100).toFixed(1)}%</p>
                                            </div>
                                            <Button
                                                className="mb-8 bg-blue-500 text-white"
                                                onClick={() => handleFollow(suggestion.id)}
                                            >
                                                {isFollowing ? "Unconnect" : "Connect"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </Slider>
                    </div>

                </div>
            )}
        </>
    );
}