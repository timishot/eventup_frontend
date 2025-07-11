'use client'
import Link from "next/link";

import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import {Button} from "@/components/ui/button";
import NavItems from "@/components/shared/NavItems";
import MobileNav from "@/components/shared/MobileNav";


import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";

const Header = () => {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (res.ok) {
                console.log('✅ Logged out');
                setIsAuthenticated(false);
                setUserId(null);
                router.push('/');
                // Optionally redirect or refresh UI
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setIsAuthenticated(data.isAuthenticated);
                setUserId(data.userId);
                console.log("Auth status:", data);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, []);
    return (
        <header className="w-full  shadow">
            <div className="wrapper flex items-center justify-between">
                <Link href="/" className="w-30">
                    <Image src="/assets/icon/logo.png" alt="eventup logo" width={128} height={38} />
                </Link>

                {isAuthenticated && (
                    <nav className="md:flex md:justify-between md: items-center hidden  w-full max-w-xs">
                        <NavItems/>
                    </nav>
                )}

                {!isAuthenticated ? (
                    <div className="flex gap-4">
                        <Button asChild className="rounded-full bg-blue-500 transition duration-300 ease-in-out hover:scale-105"  size="lg">
                            <Link href="/login" className="text-[24px] font-medium   text-white">Login</Link>
                        </Button>

                        <Button asChild className="rounded-full border border-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:scale-105" size="lg">
                            <Link href="/signup" className="text-[24px] font-medium text-blue-500  hover:text-white">Sign Up</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/profile" className="text-sm font-medium hover:underline">Profile</Link>
                        <MobileNav/>
                        <Button onClick={handleLogout} className="rounded-full bg-blue-500 transition text-white cursor-pointer duration-300 ease-in-out hover:scale-105">logout</Button>
                    </div>
                )}
            </div>
        </header>
    )
}
export default Header
