'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {useAuth} from "@/app/context/AuthContext";
import Link from "next/link";


const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
    const { login } = useAuth(); // ✅ get login function
    const router = useRouter();
    const [error, setError] = useState('');

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData?.non_field_errors?.[0] || 'Login failed');
            }

            const data = await res.json();
            console.log('✅ Login successful:', data);

            await fetch('/api/auth/set-cookie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: data.user.pk,
                    accessToken: data.access,
                    refreshToken: data.refresh,
                }),
            });

            router.push('/');


        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                console.error('Login error:', err.message);
            } else {
                setError('Something went wrong');
                console.error('Unknown login error:', err);
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
                        back!</h1>
                    <p className="text-[20px] leading-[36px] font-normal">Fill in your details.</p>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
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
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field}
                                                   className="bg-[#F6F6F6] w-[400px] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-sm text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-blue-500 text-white font-bold">
                                Log In
                            </Button>
                        </form>
                    </Form>
                    <p className="text-base font-normal text-gray-400">
                        Don't have an account {" "}
                        <Link
                            href="/signup"
                            className="font-bold text-blue-500"
                        >
                            Create an account
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
