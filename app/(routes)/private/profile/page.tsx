"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ActivateAccountAlert from "@/app/_components/warning-alert";
import { UserRoles } from "@/app/_constants/user-roles";
import TesterProfile from "./_components/tester-profile";
import AdminProfile from "./_components/admin-profile";
import ClientProfile from "./_components/client-profile";

export default function Dashboard() {
  const { data } = useSession();
  const [user, setUser] = useState<any | null>();

  useEffect(() => {
    if (data && data?.user) {
      setUser(data.user);
    }
  }, [data]);

  return (
    <main className="mx-4 mt-4">
      {user ? (
        <>
          {user?.role === UserRoles.TESTER ? <TesterProfile user={user} /> :
            user?.role === UserRoles.ADMIN ? <AdminProfile user={user} /> :
              user?.role === UserRoles.CLIENT ? <ClientProfile user={user} /> : <></>
          }
        </>
      ) : null}
    </main>
  );
}
