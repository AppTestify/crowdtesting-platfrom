import { UserRoles } from "@/app/_constants/user-roles";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const ProjectTabs = () => {
    const { data } = useSession();
    const [user, setUser] = useState<any>();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUser(user);
        }
    }, [data]);

    const getRoleBasedTabs = () => {
        if (user?.role === UserRoles.ADMIN) {
            return ["overview", "issues"];
        } else if (user?.role === UserRoles.TESTER) {
            return ["overview", "issues"];
        }
    }

    return { getRoleBasedTabs };
}