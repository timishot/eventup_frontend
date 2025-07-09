import { IEvent } from "@/types";
import Card from "@/components/shared/Card";


type CollectionProps = {
    data: IEvent[];
    emptyTitle: string;
    emptyStateSubtext: string;
    page: number;
    limit: number;
    totalPages?: number;
    collectionType: "All_Events" | "My_Tickets" | "Events_Organized";
    urlParamName?: string;
};

const Collection = ({
                        data,
                        emptyTitle,
                        emptyStateSubtext,
                        page,
                        totalPages = 0,
                        limit,
                        collectionType,
                        urlParamName,
                    }: CollectionProps) => {
    return (
        <>
            {data.length > 0 ? (
                <div className="flex flex-col items-center gap-10">
                    <ul className="grid w-full grid-col-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                        {data.map((event) => {
                            const hasOrderLink = collectionType === 'Events_Organized';
                            const hidePrice = collectionType === 'My_Tickets'
                            return(
                                <li key={event.id} className="flex justify-center">
                                    <Card event={event} hasOrderLink={hasOrderLink} hidePrice={hidePrice} />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ) : (
                <div className="flex justify-center items-center max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-gray-50 py-28 text-center">
                    <h3 className="font-bold text-[20px] leading-[30px] tracking-[2%] md:font-bold md:text-[28px] md:leading-[36px]">{emptyTitle}</h3>
                    <p className="text-[14px] font-normal leading-[20px]">{emptyStateSubtext}</p>
                </div>
            )}
        </>
    );
};

export default Collection;
