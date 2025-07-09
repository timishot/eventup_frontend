import React from 'react'
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="shadow-top">
            <div className=" max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full flex justify-between items-center flex-col gap-4 p-5 text-center sm:flex-row">
                <Link href={"/"} >
                    <Image src="/assets/icon/logo.png" alt="logo" width={128} height={38} className="mx-auto my-4" />
                </Link>
                <p>2025 EventUp. All Rights reserved</p>
            </div>
        </footer>
    )
}
export default Footer
