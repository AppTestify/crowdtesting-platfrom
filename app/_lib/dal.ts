import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "./session";
import { cache } from "react";
import { IUser } from "../_models/user.model";
import { UserRoles } from "../_constants/user-roles";
import { CookieKey } from "../_constants/cookie-keys";

export const verifySession = cache(async () => {
  const cookie = cookies().get(CookieKey.SESSION)?.value;
  const session = await decrypt(cookie);

  if (!session?.user) {
    return { isAuth: false, user: null };
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

export const isClient = cache(async (user: IUser) => {
  try {
    if (user.role !== UserRoles.CLIENT) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
});

export const isTester = cache(async (user: IUser) => {
  try {
    if (user.role !== UserRoles.TESTER) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
});
