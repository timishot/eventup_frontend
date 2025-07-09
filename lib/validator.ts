import {z} from "zod";

export const eventFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long").max(500, "Description must not exceed 500 characters"),
    location: z.string().min(3, "Location must be at least 3 characters long").max(100, "Location must not exceed 100 characters"),
    imageUrl: z.string().url("Image URL must be a valid URL").optional(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    category: z.string().min(1, "Category is required"),
    price: z.string(),
    isFree: z.boolean(),
    url: z.string().url(),
})