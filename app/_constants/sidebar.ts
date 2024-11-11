import {
  GalleryVerticalEnd,
  MonitorSmartphone,
  User,
  LayoutDashboardIcon,
  Shield,
  Users,
} from "lucide-react";
import { UserRoles } from "./user-roles";

export const teams = [
  {
    name: "Crowd Testing",
    logo: Shield,
    plan: "AppTestify",
  },
];

export const getSidebarItems = (user: any) => {
  const role = user?.role;
  if (role === UserRoles.TESTER) {
    return navMain;
  } else if (role === UserRoles.ADMIN) {
    return adminNavbar;
  }

}

export const navMain = [
  {
    title: "Dashboard",
    url: "/private/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
  },
];

export const adminNavbar = [
  {
    title: "Dashboard",
    url: "/private/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Users",
    url: "/private/users",
    icon: Users,
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
  },
];