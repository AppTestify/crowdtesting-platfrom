"use client";

import { IProjectPayload } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardClientService, getTesterDashboardService } from "@/app/_services/dashboard.service";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import ProjectTesterDashboard from "./_components/tester-dashboard";
import ProjectClientDashboard from "./_components/client-dashboard";
import ProjectAdminDashboard from "./_components/admin-dashboard";

export default function Projects() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [project, setProject] = useState<IProjectPayload>();
  const { projectId } = useParams<{ projectId: string }>();
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();

  const getProject = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectService(projectId);
      if (response) {
        setProject(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    getProject();
  }, [projectId, userData?.role]);

  return (
    <div className="mt-2 mx-4">
      {!isLoading ? (
        <div className="mb-10">
          {userData?.role === UserRoles.CLIENT ?
            <ProjectClientDashboard />
            :
            userData?.role === UserRoles.TESTER ?
              <ProjectTesterDashboard />
              : userData?.role === UserRoles.ADMIN ?
                <ProjectAdminDashboard />
                : null
            // <div
            //   className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
            //   dangerouslySetInnerHTML={{
            //     __html: project?.description || "",
            //   }}
            // />
          }
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <Skeleton className="bg-gray-200 h-[225px] w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
