import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "./session";
import { redirect } from "next/navigation";
import { cache } from "react";
import { IUser } from "../_models/user.model";
import { UserRoles } from "../_constants/user-roles";

export const verifySession = cache(async () => {
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.user) {
    redirect("/auth");
  }

  return { isAuth: true, user: JSON.parse(session.user.toString()) };
});

export const isAdmin = cache(async (user: IUser) => {
  try {
    if (user.role !== UserRoles.ADMIN) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
});
