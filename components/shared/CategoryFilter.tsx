"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {ICategory} from "@/types";

const CategoryFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState<ICategory[]>([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`https://eventup-backend.onrender.com/api/categories/`, {
                    method: 'GET',
                    credentials: 'include',
                })
                const data = await res.json()
                setCategories(data)
            } catch (err) {
                console.error("Failed to load categories", err)
            }
        }

        fetchCategories()
    }, [])


    const onSelectCategory = (category: string) => {
        let newUrl = '';

        if(category && category !== 'All') {
            newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: 'category',
                value: category
            })
        } else {
            newUrl = removeKeysFromQuery({
                params: searchParams.toString(),
                keysToRemove: ['category']
            })
        }

        router.push(newUrl, { scroll: false });
    }

    return (
        <Select onValueChange={(value: string) => onSelectCategory(value)}>
            <SelectTrigger className="sw-full bg-gray-50 h-[54px] placeholder:text-gray-500 rounded-full text-[16px] font-normal leading-[24px] px-5 py-3 border-none focus-visible:ring-transparent focus:ring-transparent !important">
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All" className="py-3 cursor-pointer  focus:bg-primary-50 text-[14px] font-normal leading-[20px]">All</SelectItem>

                {categories.map((category) => (
                    <SelectItem value={category.name} key={category.id} className="py-3 cursor-pointer  focus:bg-primary-50 text-[14px] font-normal leading-[20px]">
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default CategoryFilter