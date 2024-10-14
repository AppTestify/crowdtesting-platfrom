import Link from "next/link";
import { Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AvatarImg } from "@/app/_components/avatar";
import { IMenuItem, menuItems } from "./menuItems";
import { IUser } from "@/app/_interface/user";
import { signOut } from "next-auth/react";
export const description =
  "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";
export function Header({ user }: { user: IUser }) {
  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            // className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <img
              src="https://app.apptestify.com/static-assets/imgs/logo.png?logover="
              alt="logo"
              className="h-15"
              style={{ width: "30rem" }}
            />
            <span className="sr-only">App Testify</span>
          </Link>
          {menuItems.map((item: IMenuItem) => {
            if (item.hasPermission) {
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }
          })}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">App Testify</span>
              </Link>
              {menuItems.map((item: IMenuItem) => {
                if (item.hasPermission) {
                  return (
                    <Link
                      key={item.key}
                      href={item.path}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  );
                }
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <AvatarImg img={user.image} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <p>{user.name}</p>
              <p>{user.email}</p>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
