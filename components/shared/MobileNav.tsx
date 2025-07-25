import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image";
import {Separator} from "@/components/ui/separator";
import NavItems from "@/components/shared/NavItems";

const MobileNav = () => {
    return (
       <nav className="md:hidden">
           <Sheet>
               <SheetTrigger className="align-middle">
                   <Image src="/assets/icon/menu.svg" alt="menu" width={24} height={24} className="cursor-pointer" />
               </SheetTrigger>
               <SheetContent className="flex flex-col  gap-6 bg-white md:hidden">
                   <Image src="/assets/icon/logo.png" alt="logo"  width={128} height={38}/>
                   <Separator className="border border-gray-50 "/>
                   <div className="ml-5">
                       <NavItems />
                   </div>
               </SheetContent>
           </Sheet>
       </nav>
    )
}
export default MobileNav
