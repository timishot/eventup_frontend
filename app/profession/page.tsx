'use client'

import { useForm, Controller } from 'react-hook-form'
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {getAccessToken} from "@/lib/utils";

type FormData = {
    profession: string
    background: string
}

const PROFESSION_OPTIONS = [
    'Software Engineer',
    'Data Scientist',
    'Designer',
    'Marketing Specialist',
    'Teacher',
    'Doctor',
    'Others'
]

export default function ProfessionForm() {
    const { control, register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            profession: '',
            background: '',
        },
    })
    const router = useRouter()
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [customValue, setCustomValue] = useState('')
    const [accessToken, setAccessToken]  = useState<string | null>(null);

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

    const onSubmit = async (data: FormData) => {
        if (!accessToken) {
            console.error("Access token is not available")
            return
        }

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/update/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to save profession and background")
            }

            router.push('/profile')
        } catch (error) {
            console.error("ProfessionForm error:", error)
        }
    }

    return (
        <div className="min-h-screen flex flex-col w-full mt-28 px-4 wrapper">
            <div className="w-full flex flex-col items-center">
                <h2 className="text-5xl font-bold mb-1">Tell us about your profession</h2>
                <p className="text-2xl text-gray-500 mb-6">Add your job and background</p>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="profession" className="text-lg font-medium">Profession</label>
                        <Controller
                            name="profession"
                            control={control}
                            rules={{ required: 'Profession is required' }}
                            render={({ field }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => {
                                            if (value === 'Others') {
                                                setShowCustomInput(true)
                                                // Do not set field.value here to avoid resetting
                                            } else {
                                                setShowCustomInput(false)
                                                field.onChange(value)
                                            }
                                        }}
                                        value={showCustomInput ? 'Others' : field.value}
                                    >
                                        <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Select your profession" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {PROFESSION_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {showCustomInput && (
                                        <input
                                            value={customValue}
                                            onChange={(e) => {
                                                setCustomValue(e.target.value)
                                                field.onChange(e.target.value) // Update form state with custom value
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                                            placeholder="Enter your profession"
                                            autoFocus
                                        />
                                    )}
                                </>
                            )}
                        />
                        {errors.profession && <span className="text-red-500 text-sm">{errors.profession.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="background" className="text-lg font-medium">Background</label>
                        <textarea
                            {...register('background', { required: 'Background is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                            placeholder="e.g., 5 years of experience in tech, worked on various projects..."
                        />
                        {errors.background && <span className="text-red-500 text-sm">{errors.background.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid}
                        className="flex items-center justify-center px-20 py-6 bg-blue-700 text-white rounded-full font-semibold hover:bg-blue-800 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </form>
            </div>
        </div>
    )
}