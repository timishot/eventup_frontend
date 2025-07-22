'use client'

import { useForm, Controller } from 'react-hook-form'
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import {Button} from "@/components/ui/button";
import {getAccessToken} from "@/lib/utils";

const INTEREST_OPTIONS = [
    'Educational', 'Astronomy', 'Politics', 'Finance', 'Tech',
    'Art', 'Health', 'Travel', 'Business', 'Music'
]



export default function InterestsForm() {
    const { control, handleSubmit } = useForm()
    const router = useRouter()
    const [selected, setSelected] = useState<string[]>([])
    const [accessToken, setAccessToken]  = useState<string | null>(null);

    const toggleInterest = (interest: string) => {
        setSelected(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        )
    }

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

    const onSubmit = async () => {
        try {
            if (!accessToken) {
                console.error("Access token is not available")
                return
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/update/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({ interests: selected }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to save interests")
            }

            router.push('/profession')
        } catch (error) {
            console.error("InterestsForm error:", error)
        }
    }

    return (
        <div className="min-h-screen flex flex-col w-full mt-28 px-4 wrapper">
            <div className="w-full flex flex-col items-center">
                <h2 className="text-5xl font-bold mb-1">What are you interested in?</h2>
                <p className="text-2xl text-gray-500 mb-6">Pick your interests</p>

                <div className="flex justify-center flex-wrap gap-3 mb-10">
                    {INTEREST_OPTIONS.map((interest) => (
                        <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`px-18 py-5 rounded border text-sm transition duration-300 ease-in-out hover:scale-105 ${
                                selected.includes(interest)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-black border-gray-300'
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>

                <Button type="submit" size="lg" className="flex items-center justify-center px-20 py-6 bg-blue-700 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition" disabled={selected.length === 0} onClick={handleSubmit(onSubmit)}>Next</Button>


            </div>
        </div>
    )
}