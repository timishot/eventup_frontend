"use server"

import Stripe from 'stripe';
import { CheckoutOrderParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError} from '../utils';

export const checkoutOrder = async (order: CheckoutOrderParams) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const price = order.isFree ? 0 : Number(order.price) * 100;
    console.log('Creating Stripe session for order:', order);

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: price,
                        product_data: {
                            name: order.eventTitle,
                        }
                    },
                    quantity: 1
                },
            ],
            metadata: {
                eventId: order.eventId || "",
                buyerId: order.buyerId || "",
            },
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile`,
            cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/`,
        });


        redirect(session.url!);
    } catch (error) {
        throw error;
    }
}

export async function createOrder(orderData: {
    stripeId: string;
    eventId: string;
    buyerId: string;
    totalAmount: string;
}) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...orderData,
            event_id: orderData.eventId,
            buyer_id: orderData.buyerId,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create order");
    }

    return res.json();
}

export async function getOrdersByUser({ userId, page, limit = 3 }: { userId: string | null, page: number; limit?: number }) {

    const searchParams = new URLSearchParams({
        limit: String(limit),
        page: String(page),
    })

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/orderlist/?${searchParams.toString()}`, {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userId,
        }),
        cache: "no-store",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Failed to fetch user orders")
    }

    return res.json()
}


