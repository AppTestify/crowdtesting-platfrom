import {
  GalleryVerticalEnd,
  MonitorSmartphone,
  User,
  LayoutDashboardIcon,
  Shield,
  Users,
  Settings,
  Files,
  Mail,
  HandCoins,
  ReceiptIndianRupee,
} from "lucide-react";
import { UserRoles } from "./user-roles";

export const teams = [
  {
    name: "Test Management Platform",
    logo: Shield,
    plan: "AppTestify",
  },
];

export const getSidebarItems = (user: any) => {
  const role = user?.role;

  const isVerified = user?.isVerified;
  if (role === UserRoles.TESTER) {
    const titles = ["Projects"];
    navMain.forEach((item) => {
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return navMain;
  } else if (role === UserRoles.ADMIN) {
    adminNavbar.forEach((item) => {
      const titles = ["Projects", "Users", "Devices"];
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return adminNavbar;
  } else if (role === UserRoles.CLIENT) {
    const titles = ["Projects"];
    clientNavbar.forEach((item) => {
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return clientNavbar;
  } else if (role === UserRoles.MANAGER) {
    const titles = ["Projects"];
    clientNavbar.forEach((item) => {
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return clientNavbar;
  } else if (role === UserRoles.DEVELOPER) {
    const titles = ["Projects"];
    clientNavbar.forEach((item) => {
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return clientNavbar;
  } else if (role === UserRoles.PROJECT_ADMIN) {
    const titles = ["Projects"];
    clientNavbar.forEach((item) => {
      if (titles.includes(item.title) && !isVerified) {
        item.disabled = true;
      }
    });
    return clientNavbar;
  }
};

export const clientNavbar = [
  {
    title: "Dashboard",
    url: "/private/dashboard",
    icon: LayoutDashboardIcon,
    disabled: false,
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
    disabled: false,
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
    disabled: false,
  },
  {
    title: "Invoice",
    url: "/private/invoices",
    icon: ReceiptIndianRupee,
    disabled: false,
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
    disabled: false,
  },
];

export const navMain = [
  {
    title: "Dashboard",
    url: "/private/dashboard",
    icon: LayoutDashboardIcon,
    disabled: false,
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
    disabled: false,
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
    disabled: false,
  },
  {
    title: "Payments",
    url: "/private/payments",
    icon: HandCoins,
    disabled: false,
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
    disabled: false,
  },
];

export const adminNavbar = [
  {
    title: "Dashboard",
    url: "/private/dashboard",
    icon: LayoutDashboardIcon,
    disabled: false,
  },
  {
    title: "Users",
    url: "/private/users",
    icon: Users,
    disabled: false,
  },
  {
    title: "Projects",
    url: "/private/projects",
    icon: GalleryVerticalEnd,
    disabled: false,
  },
  {
    title: "Devices",
    url: "/private/devices",
    icon: MonitorSmartphone,
    disabled: false,
  },
  {
    title: "Emails",
    url: "/private/emails",
    icon: Mail,
    disabled: false,
  },
  {
    title: "Documents",
    url: "/private/documents",
    icon: Files,
    disabled: false,
  },
  {
    title: "Invoice",
    url: "/private/invoices",
    icon: ReceiptIndianRupee,
    disabled: false,
  },
  {
    title: "Payments",
    url: "/private/payments",
    icon: HandCoins,
    disabled: false,
  },
  {
    title: "Profile",
    url: "/private/profile",
    icon: User,
    disabled: false,
  },
  {
    title: "Settings",
    url: "/private/setting",
    icon: Settings,
    disabled: false,
  },
];
