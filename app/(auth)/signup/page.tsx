'use client';

import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";


const formSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email"),
        password1: z.string().min(8, "Password must be at least 8 characters"),
        password2: z.string().min(8),
    })
    .refine((data) => data.password1 === data.password2, {
        message: "Passwords do not match",
        path: ["password2"],
    });


export default function SignUpPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password1: "",
            password2: "",

        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setError("");

        try {
            // 1. Register user with Django backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(values),

            });

            if (!res.ok) {
                const errorData = await res.json();
                const message =
                    errorData?.detail ||
                    JSON.stringify(errorData) ||
                    "Failed to create user";
                throw new Error(message);
            }

            const data = await res.json();
            console.log("✅ User created:", data);

            // 2. Set secure cookies via API route (get-side)
            const cookieRes = await fetch("/api/auth/set-cookie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: data.user.pk,
                    accessToken: data.access,
                    refreshToken: data.refresh,
                }),
            });

            if (!cookieRes.ok) {
                throw new Error("Failed to set auth cookies.");
            }

            // 3. Redirect or update UI
            router.push("/interest");
        } catch (err) {
            if (err instanceof Error) {
                console.error("Signup error:", err.message);
                setError(err.message);
            } else {
                console.error("Unknown error during signup:", err);
                setError("Something went wrong. Please try again.");
            }
        }

    };


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
                <div className="max-w-md mx-auto mt-16 space-y-6 px-4">
                    <div className="flex justify-center">
                        <Image src="/assets/icon/logo.png" alt="logo" width={128} height={38}/>

                    </div>
                    <h1 className="text-[32px] leading-[36px] font-bold md:text-[36px] md:leading-[40px] md:font-bold">Welcome
                        to Eventup</h1>
                    <p className="text-[20px] leading-[36px] font-normal">Let connect</p>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="timishot" {...field}
                                                   className="bg-[#F6F6F6] h-[54px] w-[400px]  focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-sm text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example@mail.com" {...field}
                                                   className="bg-[#F6F6F6] h-[54px] w-[400px]  focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-sm text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password1"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}
                                                   className="bg-[#F6F6F6] h-[54px] w-[400px]  focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-sm text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password2"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}
                                                   className="bg-[#F6F6F6] h-[54px] w-[400px]  focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-sm text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-blue-500 text-white font-bold">
                                Sign Up
                            </Button>
                        </form>
                    </Form>
                    <p className="text-base font-normal text-gray-400">
                        Already have an account {" "}
                        <Link
                            href="/login"
                            className="font-bold text-blue-500"
                        >
                           Log in
                        </Link>
                    </p>
                </div>
                <div className="w-full h-screen hidden md:block">
                    <Image src="/assets/images/fix.jpg" alt="login" width={1000} height={1000}
                           className="h-screen object-cover"/>
                </div>
            </div>
        </>

    );
}
