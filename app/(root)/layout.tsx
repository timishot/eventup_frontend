"use client"
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {AuthProvider} from "@/app/context/AuthContext";

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
                    {children}
                </main>
                <Footer/>
            </AuthProvider>
        </div>
    );
}