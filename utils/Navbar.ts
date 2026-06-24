import {
  House,
  MagnifyingGlassIcon,
  ChatIcon,
  UserIcon,
  GearIcon,
  FileTextIcon
} from "@phosphor-icons/react";

export const NavLinks = [
  {
    title: "Home",
    path: "/dashboard",
    icon: House,
  },
  {
    title: "Search",
    path: "/search",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Proposals",
    path: "/proposals",
    icon: FileTextIcon,
  },
  {
    title: "Chat",
    path: "/chat",
    icon: ChatIcon,
  },
  {
    title: "Profile",
    path: "/profile",
    icon: UserIcon,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: GearIcon,
    onlyOnDesktop: true,
  },
];