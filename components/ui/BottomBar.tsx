import { useChatStore } from "@/store/useChatStore";
import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomBar = () => {
  const pathname = usePathname();
  const { activeChat } = useChatStore();

  if (pathname.startsWith("/chat") && activeChat) {
    return null;
  }

  return (
    <div className="w-full md:hidden fixed left-0 right-0 bottom-0 h-16 bg-background border-t border-border z-50 px-2">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {NavLinks.map((link, i) => {
          if (link.onlyOnDesktop) return null;

          const isActive =
            pathname === link.path ||
            (link.path !== "/" && pathname.startsWith(link.path));
          const Icon = link.icon;

          return (
            <Link
              key={i}
              href={link.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              <Icon
                className="w-6 h-6 shrink-0"
                weight={isActive ? "fill" : "regular"}
              />

              <span
                className={`text-[11px] mt-1 tracking-wide transition-colors ${
                  isActive
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary font-medium"
                }`}
              >
                {link.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;
