export interface IMenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  hasPermission: boolean;
}
export const menuItems: IMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "",
    path: "/",
    hasPermission: true,
  },
  {
    key: "users",
    label: "Users",
    icon: "",
    path: "/users",
    hasPermission: true,
  },
  {
    key: "projects",
    label: "Projects",
    icon: "",
    path: "/projects",
    hasPermission: true,
  },
];
