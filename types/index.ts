// ====== USER PARAMS
export type CreateUserParams = {
    email: string;
    password1: string;
    password2: string;
}

export type UpdateUserParams = {
    firstName: string
    lastName: string
    username: string
    photo: string
}

// ====== EVENT PARAMS
export type CreateEventParams = {
    accessToken: string | null
    event: {
        title: string
        description: string
        location: string
        imageUrl: string
        startDateTime: Date
        endDateTime: Date
        category_uuid: string
        price: string
        isFree: boolean
        url: string
    }
    path: string
}

export type UpdateEventParams = {
    userId: string | null
    event: {
        id: string | null
        title: string
        imageUrl: string
        description: string
        location: string
        startDateTime: Date
        endDateTime: Date
        category: string
        price: string
        isFree: boolean
        url: string
    }
    accessToken: string | null
    path: string
}

export interface IEvent {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    location: string;
    url: string;
    price?: string;
    isFree: boolean;
    startDateTime:  Date;
    endDateTime: Date;
    category?: {
        id: string;
        name: string;
    };
    organizer?: {
        id: string;
        username?: string;
        email?: string;
    };
}

export interface ICategory {
    id: string;
    name: string;
}

export type DeleteEventParams = {
    eventId: string
    path: string
}

export type GetAllEventsParams = {
    accessToken: string | null
    query: string
    category: string
    limit: number
    page: number
}

export type AllEventsParams ={
    query: string
    category: string
    limit: number
    page: number
}

export interface IUser {
    id: string;
    username: string | null;
    email: string;
}

export type GetEventsByUserParams = {
    accessToken: string;
    page?: number;
    limit?: number;
}

export type GetEventsByProfileUserParams = {
    userId: string | null
    limit?: number
    page?: number
}

export type GetRelatedEventsByCategoryParams = {
    category: string
    eventId: string
    limit: number
    page: number | string
}

export interface IOrderItem {
    id: string;
    created_at: string; // ISO date string from API
    stripe_id: string;
    total_amount: string; // API returns as string
    event: {
        id: string;
        title: string;
    };
    buyer: {
        id: string;
        username: string;
        email: string;
        interests: string[];
        profession: string;
        background: string;
    };
}

export type Event = {
    _id: string
    title: string
    description: string
    price: string
    isFree: boolean
    imageUrl: string
    location: string
    startDateTime: Date
    endDateTime: Date
    url: string
    organizer: {
        _id: string
        firstName: string
        lastName: string
    }
    category: {
        _id: string
        name: string
    }
}

// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
    categoryName: string
}

// ====== ORDER PARAMS
export type CheckoutOrderParams = {
    eventTitle: string
    eventId: string | undefined
    price: string | undefined
    isFree: boolean
    buyerId: string | null
}

export type CreateOrderParams = {
    stripeId: string
    eventId: string
    buyerId: string
    totalAmount: string
    createdAt: Date
}

export type GetOrdersByEventParams = {
    eventId: string
    searchString: string
}

export type GetOrdersByUserParams = {
    userId: string | null
    limit?: number
    page: string | number | null
}

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
    params: string
    key: string
    value: string | null
}

export type RemoveUrlQueryParams = {
    params: string
    keysToRemove: string[]
}

export type SearchParamProps = {
    params: Promise<{ id: string }>;
    searchParams: { [key: string]: string | string[] | undefined }
}

export interface IRelationship {
    id: string;
    follower: {
        id: string;
        username: string | null;
        email: string;
    };
    followee: {
        id: string;
        username: string | null;
        email: string;

    };
    created_at: string;
}

export interface IUser {
    id: string;
    username: string | null;
    email: string;
    avatar?: string;
}