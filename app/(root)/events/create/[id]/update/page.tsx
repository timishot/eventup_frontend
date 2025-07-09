'use client'
import EventForm from "@/components/shared/EventForm";
import {useEffect, useState} from "react";
import {getAuthStatus} from "@/lib/utils";

const UpdateEvent = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        getAuthStatus()
            .then(data => {
                setIsAuthenticated(data.isAuthenticated);
                setUserId(data.userId);
                console.log('Auth status:', data);
                console.log(isAuthenticated)
            })
            .catch(error => {
                console.error('Failed to fetch auth status:', error);
            });
    }, []);
    return (
        <>
            <section className="bg-[#F6F8FD] bg-cover bg-center py-5 md:py-10">
                <h3 className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">Create
                    Event</h3>
            </section>
            <div className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 ">
                <EventForm userId={userId} type="Update"/>
            </div>
        </>

    )
}
export default UpdateEvent