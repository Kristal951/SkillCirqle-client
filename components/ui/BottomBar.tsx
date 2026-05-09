import { useChatStore } from "@/store/useChatStore";
import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomBar = () => {
  const pathname = usePathname();
  const {activeChat} = useChatStore()

  if(pathname.startsWith('/chat') && activeChat){
    return null
  }

  return (
    <div className="w-full md:hidden fixed left-0 right-0 bottom-0 h-16 flex items-center justify-around bg-background border-t border-border z-50">
      {NavLinks.map((link, i) => {
        const isActive =
          pathname === link.path ||
          (link.path !== "/" && pathname.startsWith(link.path));

        return (
          <Link
            key={i}
            href={link.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              isActive
                ? "text-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {link.icon}
            </span>
            <span className="text-[10px] mt-1 font-medium">{link.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomBar;
