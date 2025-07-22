'use client';
import Link from "next/link";
import { IUser } from "@/types";
import Pagination from "@/components/shared/Pagination";

type UserListProps = {
    data: IUser[];
    emptyTitle: string;
    emptyStateSubtext: string;
    page: number | string;
    totalPages?: number;
    urlParamName?: string;
};

const UserList = ({
                      data,
                      emptyTitle,
                      emptyStateSubtext,
                      page,
                      totalPages = 0,
                      urlParamName,
                  }: UserListProps) => {
    return (
        <>
            {data.length > 0 ? (
                <div className="flex flex-col items-center gap-10">
                    <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                        {data.map((user) => (
                            <li key={user.id} className="flex justify-center">
                                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm w-full">
                                    <div>
                                        <Link href={`/profile/${user.id}`}>
                                            <p className="text-[16px] font-medium text-gray-800 hover:underline">
                                                {user.username || "Unknown User"}
                                            </p>
                                        </Link>
                                        <p className="text-[14px] text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {totalPages > 1 && (
                        <Pagination page={page} totalPages={totalPages} urlParamName={urlParamName} />
                    )}
                </div>
            ) : (
                <div className="flex justify-center items-center max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full min-h-[200px] flex-col gap-3 rounded-[14px] bg-gray-50 py-28 text-center">
                    <h3 className="font-bold text-[20px] leading-[30px] tracking-[2%] md:font-bold md:text-[28px] md:leading-[36px]">
                        {emptyTitle}
                    </h3>
                    <p className="text-[14px] font-normal leading-[20px]">{emptyStateSubtext}</p>
                </div>
            )}
        </>
    );
};

export default UserList;