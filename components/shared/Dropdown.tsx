'use client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {startTransition, useEffect, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Input} from "@/components/ui/input";

type DropdownProps = {
    value?: string
    onchangeHandler?: () => void
}

interface ICategory {
    id: string;
    name: string;
}

const Dropdown = ({value, onchangeHandler} : DropdownProps) => {
    const [categories, setCategories] = useState<ICategory[]>([

    ]);

    const [newCategory, setNewCategory] = useState<string>('');

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

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return

        try {
            const res = await fetch(`https://eventup-backend.onrender.com/api/categories/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: newCategory }),
            })

            if (!res.ok) throw new Error("Failed to add category")
            const data: ICategory = await res.json()

            setCategories((prev) => [...prev, data])
            setNewCategory('') // Clear input
        } catch (err) {
            console.error("Error adding category", err)
        }
    }

    return (
        <Select onValueChange={onchangeHandler} defaultValue={value}>
            <SelectTrigger className="w-full bg-[#F6F6F6] h-[54px] placeholder:text-[#757575] rounded-full p-regular-16 px-5 py-3 border-none focus-visible:ring-transparent focus:ring-transparent !important">
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                {categories.length > 0 && categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="py-3 cursor-pointer  focus:bg-[#F6F8FD] bg-white text-[14px] font-normal leading-[20px]">{category.name}</SelectItem>
                ))}
                <AlertDialog>
                    <AlertDialogTrigger className="text-[14px] font-medium leading-[20px] flex w-full rounded-sm py-3 pl-8 text-blue-500 hover:bg-[#F6F8FD]  focus:text-blue-500">+ Add New Category</AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>New Category</AlertDialogTitle>
                            <AlertDialogDescription>
                                <Input type="text" placeholder="category name" className="mt-3 bg-[#F6F8FD] h-[54px] focus-visible:ring-offset-0 placeholder:text-[#757575] rounded-full text-[16px] font-normal leading-[24px] px-4 py-3 border-none focus-visible:ring-transparent !important" onChange={(e) => setNewCategory(e.target.value)} />
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => startTransition(handleAddCategory)}>Add</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SelectContent>
        </Select>
    )
}
export default Dropdown
