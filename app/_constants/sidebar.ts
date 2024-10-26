import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Command,
  MonitorSmartphone,
  User,
  LayoutDashboardIcon,
  Shield,
} from "lucide-react";

export const teams = [
  {
    name: "Crowd Testing",
    logo: Shield,
    plan: "AppTestify",
  },
];

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
