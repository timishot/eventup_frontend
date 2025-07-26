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

        console.log('Orders:', orders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        errorMessage = 'Failed to load orders. Please try again later.';
    }
    return (
        <>
            <section className=" bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <h3 className="wrapper h3-bold text-center sm:text-left ">Orders</h3>
            </section>

            <section className="wrapper mt-8">
                <Search placeholder="Search buyer name..." />
            </section>

            <section className="wrapper overflow-x-auto">
                <table className="w-full border-collapse border-t">
                    <thead>
                    <tr className="p-medium-14 border-b text-grey-500">
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
                                        className="p-regular-14 lg:p-regular-16 border-b "
                                        style={{ boxSizing: 'border-box' }}>
                                        <td className="min-w-[250px] py-4 text-primary-500">{row.id}</td>
                                        <td className="min-w-[200px] flex-1 py-4 pr-4">{row.eventTitle}</td>
                                        <td className="min-w-[150px] py-4">{row.buyer}</td>
                                        <td className="min-w-[100px] py-4">
                                            {formatDateTime(row.createdAt).dateTime}
                                        </td>
                                        <td className="min-w-[100px] py-4 text-right">
                                            {formatPrice(row.totalAmount)}
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