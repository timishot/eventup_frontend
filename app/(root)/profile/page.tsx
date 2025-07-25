'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Collection from "@/components/shared/Collection";
import {use, useEffect, useState} from "react";
import { getAccessToken } from "@/lib/utils";
import {getEventsByProfileUser, getEventsByUser} from "@/lib/actions/event";
import { followUser, unfollowUser, getFollowers, getFollowing, checkFollowStatus } from "@/lib/actions/relationship.actions";
import { useParams } from "next/navigation";
import {IEvent} from "@/types";
import {getOrdersByUser} from "@/lib/actions/order.actions";


const UserProfilePage = () => {

    const [events, setEvents] = useState<any[]>([]);
    const [event, setEvent] = useState<IEvent[]>();
    const [accessToken, setAccessToken] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [orderEvents, setOrderEvents] = useState<IEvent[]>([]);

    useEffect(() => {
        getAccessToken()
            .then(data => {
                setAccessToken(data.accessToken);
            })
            .catch(error => {
                console.error('Failed to fetch Access Token status:', error);
            });
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;

            try {
                const followers = await getFollowers({ userId: userId as string });
                const following = await getFollowing({ userId: userId as string});
                const userEvents = await getEventsByProfileUser({  page: 1, userId: userId as string });
                setEvents(userEvents.data);
                setFollowersCount(followers.meta?.total || 0);
                setFollowingCount(following.meta?.total || 0);

                // Fetch user details (assuming an endpoint exists)
                const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${userId}`);
                const userData = await userRes.json();
                setProfileUser(userData);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            }
        };

        fetchProfileData();
    }, [userId, accessToken]);

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
        const fetchEventByUser = async () => {
            if (!accessToken) return; // 🔒 don't fetch until token exists

            try {
                const organizedEvents = await getEventsByUser({ accessToken, page: 1 });
                setEvent(organizedEvents.data);
            } catch (error) {
                console.error("Failed to fetch event:", error);
            }
        };

        fetchEventByUser();
    }, [accessToken]);

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!accessToken || !userId ) return;

            try {
                const status = await checkFollowStatus({ userId: userId as string, accessToken, currentUserId: userId });
                setIsFollowing(status);
            } catch (error) {
                console.error("Failed to check follow status:", error);
            }
        };

        fetchFollowStatus();
    }, [accessToken, userId]);

    const handleFollowToggle = async () => {
        if (!accessToken || !userId) return;

        try {
            if (isFollowing) {
                await unfollowUser({ userId: userId as string, accessToken });
                setFollowersCount(prev => prev - 1);
                setIsFollowing(false);
            } else {
                await followUser({ userId: userId as string, accessToken });
                setFollowersCount(prev => prev + 1);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        }
    };

    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };



    return (
        <>
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10 mb-14">
                <div className="wrapper flex items-center justify-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
                        <div>
                            <h3 className="font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">
                                {profileUser?.username || 'User'}'s Profile
                            </h3>
                            <p className=""><span className="font-semibold text-gray-500">Email:</span> {' '} {profileUser?.email}</p>
                            <p className="font-normal"><span className="font-semibold text-gray-500">Background:</span> {' '}{profileUser?.background}</p>
                            <p><span className="font-semibold text-gray-500">Profession:</span> {' '}{profileUser?.profession}</p>
                            <p><span className="font-semibold text-gray-500">Interests:</span> {' '}{profileUser?.interests.join(', ')}</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href={`/profile/${userId}/followers`}>
                                <p className="text-[16px] font-medium text-gray-600">
                                    Followers: {formatCount(followersCount)}
                                </p>
                            </Link>
                            <Link href={`/profile/${userId}/following`}>
                                <p className="text-[16px] font-medium text-gray-600">
                                    Following: {formatCount(followingCount)}
                                </p>
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="wrapper flex items-center justify-center sm:justify-between">

                </div>


            </section>

            {/* My Tickets   */}
                <>
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
                        <Collection data={orderEvents  || []} emptyTitle="No Event tickets purchased yet"
                                    emptyStateSubtext="No worries - plenty of exciting events to explore!"
                                    collectionType="My_Tickets" limit={3} page={1} urlParamName="ordersPage"
                                    totalPages={2}/>
                    </section>
                </>


            {/* Events Organized */}

            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className="wrapper flex items-center justify-center sm:justify-between">
                    <h3 className="font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">
                        Events Organized
                    </h3>
                </div>
            </section>

            <section className="wrapper my-8">
                <Collection
                    data={events || []}
                    emptyTitle="No events have been created yet"
                    emptyStateSubtext="No events found for this user"
                    collectionType="Events_Organized"
                    limit={6}
                    page={1}
                    urlParamName="eventsPage"
                    totalPages={2}
                />
            </section>
        </>
    );
};

export default UserProfilePage;