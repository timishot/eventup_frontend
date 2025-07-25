"use client";
import {headerLinks} from "@/constants";
import Link from "next/link";
import {usePathname} from "next/navigation";

const NavItems = () => {
    const pathname = usePathname();
    return (
       <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
           {headerLinks.map((link) => {
               const isActive = pathname === link.route;
               return(
                   <li key={link.route} className={`${isActive && 'text-blue-500 font-semibold'} flex justify-center items-center text-[16px] font-normal leading-[24px] whitespace-nowrap`}>
                       <Link href={link.route} >
                           {link.label}
                       </Link>
                   </li>
               )
           })}

       </ul>
    )
}
export default NavItems
