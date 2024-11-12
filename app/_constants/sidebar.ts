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
  const isActive = user?.isActive;
  if (role === UserRoles.TESTER) {
    navMain.forEach((item) => {
      if (item.title === "Projects" && !isActive) {
        item.disabled = true;
      }
    });
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
    disabled: false
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
    disabled: false
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
    disabled: false
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
    disabled: false
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