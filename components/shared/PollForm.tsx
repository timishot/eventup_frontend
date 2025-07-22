'use client'

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const pollSchema = z.object({
    question: z.string().min(1, 'Poll question is required'),
    options: z
        .array(z.object({ option: z.string().min(1, 'Option is required') }))
        .min(2, 'At least two options are required'),
});

export type PollFormValues = z.infer<typeof pollSchema>;

const PollForm = ({ eventId }: { eventId: string }) => {
    const router = useRouter();
    const form = useForm<PollFormValues>({
        resolver: zodResolver(pollSchema),
        defaultValues: {
            question: '',
            options: [{ option: '' }, { option: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: 'options',
        control: form.control,
    });

    const onSubmit = async (values: PollFormValues) => {
        try {
            const response = await fetch('/api/auth/accessToken');
            if (!response.ok) throw new Error('Failed to fetch access token');
            const { accessToken } = await response.json();

            console.log('Submitting poll with values:', values);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls/${eventId}/polls/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    text: values.question,
                    event_uuid: eventId,
                    input_choices: values.options.map((o) => ({ text: o.option })),
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create poll');
            }
            const data = await res.json(); // Parse the response data
            console.log('Poll creation response:', data);

            router.push(`/events/${eventId}`);
        } catch (error) {
            console.error('Poll creation error:', error);
            form.setError('root', { message: 'Failed to create poll' });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="wrapper">
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Poll Question"
                                    {...field}
                                    className="bg-[#F6F6F6] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full p-regular-16 px-4 py-3 border-none focus-visible:ring-transparent mb-8"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4 mb-8 md:flex-row flex-wrap w-full">
                    {fields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`options.${index}.option`}
                            render={({ field }) => (
                                <FormItem className="flex gap-2 items-center">
                                    <FormControl className="flex flex-col gap-5">
                                        <Input
                                            placeholder={`Option ${index + 1}`}
                                            {...field}
                                            className="bg-[#F6F6F6] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full p-regular-16 px-4 py-3 border-none focus-visible:ring-transparent"
                                        />
                                    </FormControl>
                                    {fields.length > 2 && (
                                        <Button type="button" variant="ghost" onClick={() => remove(index)} className="text-blue-500">
                                            Remove
                                        </Button>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => append({ option: '' })}
                    className="flex cursor-pointer items-center rounded-full h-[54px] text-[16px] font-normal leading-[24px] col-span-2 bg-blue-500 text-white"
                >
                    Add Option
                </Button>

                <div className="flex w-full items-center justify-center mt-8">
                    <Button
                        type="submit"
                        className="rounded-full h-[54px] text-[16px] font-normal leading-[24px] col-span-2 w-[350px] cursor-pointer transition duration-300 ease-in-out hover:scale-105 bg-blue-500 text-white"
                    >
                        Create Poll
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PollForm;