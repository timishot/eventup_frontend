'use client';
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import UserList from "@/components/shared/UserList";
import { getAccessToken } from "@/lib/utils";
import { getFollowing } from "@/lib/actions/relationship.actions";
import { IUser, IRelationship } from "@/types";

const FollowingPage = () => {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1");
    const [following, setFollowing] = useState<IUser[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [accessToken, setAccessToken] = useState<string>("");

    useEffect(() => {
        getAccessToken()
            .then(data => {
                setAccessToken(data.accessToken);
            })
            .catch(error => {
                console.error("Failed to fetch Access Token status:", error);
            });
    }, []);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!id) return;

            try {
                const response = await getFollowing({ userId: id as string, page, limit: 10 });
                console.log("Following response:", response);
                const followingUsers = response.data.map((rel: IRelationship) => rel.followee);
                setFollowing(followingUsers);
                setTotalPages(response.meta?.totalPages || 1);
            } catch (error) {
                console.error("Failed to fetch following:", error);
            }
        };

        fetchFollowing();
    }, [id, page, accessToken]);

    return (
        <>
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className="wrapper flex items-center justify-center sm:justify-between">
                    <h3 className="font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">
                        Following
                    </h3>
                </div>
            </section>

            <section className="wrapper my-8">
                <UserList
                    data={following}
                    emptyTitle="Not following anyone yet"
                    emptyStateSubtext="This user is not following anyone at the moment."
                    page={page}
                    totalPages={totalPages}
                    urlParamName="page"
                />
            </section>
        </>
    );
};

export default FollowingPage;