import Search  from '@/components/shared/Search'
import { getOrdersByEvent } from '@/lib/actions/order.actions'
import { formatDateTime, formatPrice } from '@/lib/utils'
import {IOrderItem} from '@/types'

interface SearchParamProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Orders = async ({ searchParams }: SearchParamProps) => {
    // Resolve the searchParams Promise
    const resolvedSearchParams = await searchParams;
    // Normalize eventId to a stringtime
    const eventId = Array.isArray(resolvedSearchParams.eventId)
        ? resolvedSearchParams.eventId[0] || '' // Take first value if array
        : resolvedSearchParams.eventId || ''; // Use string or fallback to ''
    const searchText = Array.isArray(resolvedSearchParams.query)
        ? resolvedSearchParams.query[0] || '' // Take first value if array
        : resolvedSearchParams.query || ''; // Use string or fallback to ''

    let orders: IOrderItem[] = [];
    let errorMessage: string | null = null;

    try {
        // Fetch orders by event ID and search text
        orders = await getOrdersByEvent({ eventId, searchString: searchText });
        console.log('Orders:', orders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        errorMessage = 'Failed to load orders. Please try again later.';
    }
    return (
        <>
            <section className=" bg-[#F6F8FD] bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <h3 className="wrapper font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left ">Orders</h3>
            </section>

            <section className="wrapper mt-8">
                <Search placeholder="Search buyer name..." />
            </section>

            <section className="wrapper overflow-x-auto">
                <table className="w-full border-collapse border-t">
                    <thead>
                    <tr className="text-[14px] font-medium leading-[20px] border-b text-grey-500">
                        <th className="min-w-[250px] py-3 text-left">Order ID</th>
                        <th className="min-w-[200px] flex-1 py-3 pr-4 text-left">Event Title</th>
                        <th className="min-w-[150px] py-3 text-left">Buyer</th>
                        <th className="min-w-[100px] py-3 text-left">Created</th>
                        <th className="min-w-[100px] py-3 text-right">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders && orders.length === 0 ? (
                        <tr className="border-b">
                            <td colSpan={5} className="py-4 text-center text-gray-500">
                                No orders found.
                            </td>
                        </tr>
                    ) : (
                        <>
                            {orders &&
                                orders.map((row: IOrderItem) => (
                                    <tr
                                        key={row.id}
                                        className="text-[14px] font-normal leading-[20px] lg:text-[16px] lg:font-normal lg:leading-[24px] border-b "
                                        style={{ boxSizing: 'border-box' }}>
                                        <td className="min-w-[250px] py-4 text-primary-500">{row.id}</td>
                                        <td className="min-w-[200px] flex-1 py-4 pr-4">{row.event.title}</td>
                                        <td className="min-w-[150px] py-4">{row.buyer.username}</td>
                                        <td className="min-w-[100px] py-4">
                                            {formatDateTime(new Date(row.created_at)).dateTime}
                                        </td>
                                        <td className="min-w-[100px] py-4 text-right">
                                            {formatPrice((row.total_amount))}
                                        </td>
                                    </tr>
                                ))}
                        </>
                    )}
                    </tbody>
                </table>
            </section>
        </>
    )
}

export default Orders