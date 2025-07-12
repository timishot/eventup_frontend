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
            const res = await fetch('https://eventup-backend.onrender.com/api/auth/login/', {
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

            // You can store the access token, e.g. in localStorage
            // if(data.access){
            //     await handleLogin(data.user.id, data.access, data.refresh);
            // }
            // console.log('Storing access token:', data.access);

            // // localStorage.setItem('accessToken', data.access);
            // router.push('/'); // Redirect to dashboard/home
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
        <div className="max-w-md mx-auto mt-16 space-y-6 px-4">
            <div className="flex justify-center">
                <Image src="/assets/icon/logo.png" alt="logo" width={128} height={38} />
            </div>
            <h1 className="text-2xl font-bold text-center">Login to Eventup</h1>
            <p className="text-center text-muted-foreground">Welcome back!</p>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="example@mail.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        Log In
                    </Button>
                </form>
            </Form>
        </div>
    );
}
