import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { NavLinks } from "@/utils/Navbar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomBar = () => {
  const pathname = usePathname();
  const { activeChat } = useChatStore();
  const { user } = useAuthStore();

  if (pathname.startsWith("/chat") && activeChat) {
    return null;
  }

  return (
    <div className="w-full md:hidden fixed left-0 right-0 bottom-0 h-16 flex items-center justify-around bg-background border-t border-border z-50">
      {NavLinks.map((link, i) => {
        const isProfile = link.path === "/profile";
        const isActive =
          pathname === link.path ||
          (link.path !== "/" && pathname.startsWith(link.path));

        return (
          <Link
            key={i}
            href={link.path}
            className={` flex-col items-center ${link.onlyOnDesktop ? 'hidden' : 'flex'} justify-center flex-1 h-full transition-all duration-200 ${
              isActive
                ? "text-primary"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            {isProfile ? (
              <>
                <div className="relative w-8 h-8 md:hidden shrink-0">
                  <Image
                    src={user?.avatar_url || "/default-avatar.png"}
                    alt={user?.name || "Profile"}
                    fill
                    sizes="28px"
                    className="rounded-full object-cover border border-border/30"
                    unoptimized
                  />
                </div>
              </>
            ) : (
              <span className="material-symbols-outlined text-2xl shrink-0">
                {link.icon}
              </span>
            )}
            <span className="text-[10px] mt-1 font-medium">{link.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomBar;
