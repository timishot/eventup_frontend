"use client"
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {AuthProvider} from "@/app/context/AuthContext";
import Loading from "@/components/shared/Loading";
import {Suspense} from "react";

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
                    <Suspense fallback={<Loading />} />
                    {children}
                </main>
                <Footer/>
            </AuthProvider>
        </div>
    );
}