"use client"
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {AuthProvider} from "@/app/context/AuthContext";
import Loading from "@/components/shared/Loading";
import {Suspense} from "react";
import {Toaster} from "@/components/ui/sonner";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen flex-col">
            <AuthProvider>
                <Header/>
                <main className="flex-1">
                    <Suspense fallback={<Loading />}>
                        {children}
                        <Toaster richColors position="top-right" />
                    </Suspense>
                </main>
                <Footer/>
            </AuthProvider>
        </div>
    );
}