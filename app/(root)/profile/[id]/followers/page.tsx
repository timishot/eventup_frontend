'use client';
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import UserList from "@/components/shared/UserList";
import { getAccessToken } from "@/lib/utils";
import { getFollowers } from "@/lib/actions/relationship.actions";
import { IUser, IRelationship } from "@/types";

const FollowersPage = () => {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1");
    const [followers, setFollowers] = useState<IUser[]>([]);
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
        const fetchFollowers = async () => {
            if (!id) return;

            try {
                const response = await getFollowers({ userId: id as string, page, limit: 10 });
                console.log("Followers response:", response);
                const followerUsers = response.data.map((rel: IRelationship) => rel.follower);
                setFollowers(followerUsers);
                setTotalPages(response.meta?.totalPages || 1);
            } catch (error) {
                console.error("Failed to fetch followers:", error);
            }
        };

        fetchFollowers();
    }, [id, page, accessToken]);

    return (
        <>
            <section className="bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className="wrapper flex items-center justify-center sm:justify-between">
                    <h3 className="font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">
                        Followers
                    </h3>
                </div>
            </section>

            <section className="wrapper my-8">
                <UserList
                    data={followers}
                    emptyTitle="No followers yet"
                    emptyStateSubtext="This user has no followers at the moment."
                    page={page}
                    totalPages={totalPages}
                    urlParamName="page"
                />
            </section>
        </>
    );
};

export default FollowersPage;