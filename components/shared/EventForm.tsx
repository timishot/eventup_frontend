'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { eventFormSchema } from "@/lib/validator";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {eventDefaultValues} from "@/constants";
import Dropdown from "@/components/shared/Dropdown";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/shared/fileUploader";
import {useEffect, useState} from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {useUploadThing} from "@/lib/uploadthing";
import {useRouter} from "next/navigation";
import {CreateEvent, UpdateEvent} from "@/lib/actions/event";
import {getAccessToken} from "@/lib/utils";
import {IEvent} from "@/types";
import {router} from "next/client";

type EventFormProps = {
    userId: string | null;
    type: 'Create' | 'Update';
    event?: IEvent,
    eventId?: string
}

const EventForm = ({userId, type, event, eventId }: EventFormProps ) => {
    const [startDate, setStartDate] = useState(new Date());
    const Router = useRouter();
    const [accessToken, setAccessToken]  = useState<string | null>(null);

    const [files, setFiles] = useState<File[]>([]);
    const initialValues = event && type === 'Update' ? { ...event, category: event.category?.name ,  startDateTime: new Date(event.startDateTime), endDateTime: new Date(event.endDateTime) } : eventDefaultValues;
    const {startUpload} = useUploadThing('imageUploader')
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialValues
    })
    useEffect(() => {
        getAccessToken()
            .then(data => {

                setAccessToken(data.accessToken);
                console.log('Access Token', data);
            })
            .catch(error => {
                console.error('Failed to fetch Access Token status:', error);
            });
    }, []);



    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        let uploadedImageUrl = values.imageUrl;

        if(files.length > 0) {
            const uploadedImages = await startUpload(files)
            if(!uploadedImageUrl) {
                console.error('Image upload failed');
                return;
            }

            uploadedImageUrl = uploadedImages?.[0]?.url
        }
         console.log('Submitted values:', values);

        if (type === "Create") {
            try {
                const newEvent = await CreateEvent({
                    accessToken: accessToken,
                    event: {
                        title: values.title,
                        description: values.description,
                        location: values.location,
                        imageUrl: uploadedImageUrl as string,
                        category_uuid: values.category,
                        isFree: values.isFree,
                        price: values.price,  // optional price
                        url: values.url,
                        startDateTime: values.startDateTime,
                        endDateTime: values.endDateTime,
                    },
                    path: "/profile",
                });

                if (newEvent) {
                    form.reset();
                    Router.push(`/events/${newEvent.id}`);
                }
            } catch (error) {
                console.error("Error creating event:", error);
            }
        }
        if (type === "Update") {
            if (!eventId) {
                console.error("Event ID is required for update");
                router.back()
                return;
            }
            try {
                console.log("step up update event eventform", accessToken)
                const updatedEvent = await UpdateEvent({
                    userId,
                    accessToken: accessToken,
                    event: {
                        id: eventId,
                        title: values.title,
                        description: values.description,
                        location: values.location,
                        imageUrl: uploadedImageUrl as string,
                        category: values.category,
                        isFree: values.isFree,
                        price: values.price,  // optional price
                        url: values.url,
                        startDateTime: values.startDateTime,
                        endDateTime: values.endDateTime,
                    },
                    path: `/events/${eventId}`,
                });

                if (updatedEvent) {
                    form.reset();
                    Router.push(`/events/${updatedEvent.id}`);
                }
            } catch (error) {
                console.error("Error creating event:", error);
            }
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Event title" {...field}
                                           className=" bg-[#F6F6F6] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full p-regular-16 px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/*Category*/}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Dropdown onchangeHandler={field.onChange} value={field.value}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl className="h-72">
                                    <Textarea placeholder="Description" {...field}
                                              className=" bg-[#F6F6F6] flex flex-1 placeholder:text-[#757575] text-[16px] font-normal leading-[24px] px-5 py-3 border-none focus-visible:ring-transparent !important rounded-2xl"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl className="h-72">
                                    <FileUploader onFieldChange={field.onChange} imageUrl={field.value}
                                                  setFiles={setFiles}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div
                                        className="flex justify-center items-center h-[54px] w-full overflow-hidden rounded-full bg-[#F6F6F6] px-4 py-2 ">
                                        <Image src="/assets/icon/location-grey.svg" alt="location" width={24}
                                               height={24}/>
                                        <Input placeholder="Event Location or Online" {...field}
                                               className=" bg-[#F6F6F6] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full p-regular-16 px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="startDateTime"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div
                                        className="flex justify-center items-center h-[54px] w-full overflow-hidden rounded-full bg-[#F6F6F6] px-4 py-2 ">
                                        <Image src="/assets/icon/calendar.svg" alt="location" width={24}
                                               height={24}/>
                                        <p className="ml-3 whitespace-nowrap text-[#545454]">Start Date:</p>
                                        <DatePicker selected={field.value} onChange={(date) => field.onChange(date)}
                                                    showTimeSelect timeInputLabel="Time:"
                                                    dateFormat="MM/dd/yyyy h:mm aa" wrapperClassName="width: 100%"
                                                    className="w-full"/>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="endDateTime"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div
                                        className="flex justify-center items-center h-[54px] w-full overflow-hidden rounded-full bg-[#F6F6F6] px-4 py-2 ">
                                        <Image src="/assets/icon/calendar.svg" alt="location" width={24}
                                               height={24}/>
                                        <p className="ml-3 whitespace-nowrap text-[#545454]">End Date:</p>
                                        <DatePicker selected={field.value} onChange={(date) => field.onChange(date)}
                                                    showTimeSelect timeInputLabel="Time:"
                                                    dateFormat="MM/dd/yyyy h:mm aa" wrapperClassName="width: 100%"
                                                    className="w-full"/>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div
                                        className="flex justify-center items-center h-[54px] w-full overflow-hidden rounded-full bg-[#F6F8FD] px-4 py-2">
                                        <Image
                                            src="/assets/icon/dollar.svg"
                                            alt="dollar"
                                            width={24}
                                            height={24}
                                            className="filter-grey"
                                        />
                                        <Input type="number" placeholder="Price" {...field}
                                               className="text-[16px] font-normal leading-[24px] border-0 bg-[#F6F8FD] outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                                        <FormField
                                            control={form.control}
                                            name="isFree"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center">
                                                            <label htmlFor="isFree"
                                                                   className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Free
                                                                Ticket</label>
                                                            <Checkbox
                                                                onCheckedChange={field.onChange}
                                                                checked={field.value}
                                                                id="isFree"
                                                                className="mr-2 h-5 w-5 border-2 border-[#624CF5]"/>
                                                        </div>

                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="url"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div
                                        className="flex justify-center items-center h-[54px] w-full overflow-hidden rounded-full bg-[#F6F6F6] px-4 py-2">
                                        <Image
                                            src="/assets/icon/link.svg"
                                            alt="link"
                                            width={24}
                                            height={24}
                                        />

                                        <Input placeholder="URL" {...field} className="bg-[#F6F6F6] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                    </div>

                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={form.formState.isSubmitted || !accessToken} size="lg" className="rounded-full h-[54px] p-regular-16 col-span-2 w-full bg-blue-500 text-white" >{form.formState.isSubmitted ? ('Submitting...'): `${type} Event`}</Button>
            </form>
        </Form>
    )
}
export default EventForm
