'use client'

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/utils";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const qnaSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters long"),
});

export type QnAFormValues = z.infer<typeof qnaSchema>;

const CreateQnAPage = ({ eventId }: { eventId: string }) => {
    const router = useRouter();

    const [accessToken, setAccessToken] = useState<string | null>(null);

    const form = useForm<QnAFormValues>({
        resolver: zodResolver(qnaSchema),
        defaultValues: {
            question: "",
        },
    });

    useEffect(() => {
        getAccessToken()
            .then((data) => setAccessToken(data.accessToken))
            .catch((err) => console.error("Failed to fetch token:", err));
    }, []);

    const onSubmit = async (values: QnAFormValues) => {
        if (!accessToken) {
            form.setError('root', { message: 'Authentication required' });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qns/${eventId}/questions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    text: values.question,
                    event_uuid: eventId,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create question');
            }

            form.reset();
            router.push(`/events/${eventId}`);
        } catch (error) {
            console.error("Failed to create QnA:", error);
            form.setError('root', { message: 'Failed to create question' });
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10">
            <h1 className="text-2xl font-semibold mb-4">Create Q&A</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your question"
                                        {...field}
                                        className="bg-[#F6F6F6] h-[54px] placeholder:text-[#757575] rounded-full px-4 py-3 border-none focus-visible:ring-transparent"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || !accessToken}
                        className="rounded-full h-[54px] bg-blue-500 text-white"
                        size="lg"
                    >
                        {form.formState.isSubmitting ? "Submitting..." : "Submit Question"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default CreateQnAPage;