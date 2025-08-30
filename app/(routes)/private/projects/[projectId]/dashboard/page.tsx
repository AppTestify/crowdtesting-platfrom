"use client";

import { IProjectPayload } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import ProjectTesterDashboard from "./_components/tester-dashboard";
import ProjectClientDashboard from "./_components/client-dashboard";
import ProjectAdminDashboard from "./_components/admin-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Activity } from "lucide-react";
import { format } from "date-fns";

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

  // Helper function to extract text content from HTML strings
  const extractTextContent = (htmlString: string | undefined): string => {
    if (!htmlString) return '';
    
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // Return text content, fallback to original string if no HTML
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.trim() || htmlString;
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
    <div className="mt-2 mx-5">
      {!isLoading ? (
        <div className="mb-5 space-y-6">
          {/* Project Info Header */}
          {project && (
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-green-700">
                      {extractTextContent(project.title)}
                    </h2>
                    {project.description && (
                      <p className="text-gray-600 text-lg mt-1">
                        {extractTextContent(project.description)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                      <Activity className="h-3 w-3" />
                      {project.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-100">
                      <User className="h-3 w-3" />
                      {userData?.role || "User"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role-based Dashboard */}
          {userData?.role === UserRoles.TESTER || userData?.role === UserRoles.CROWD_TESTER ?
            <ProjectTesterDashboard />
            : userData?.role === UserRoles.ADMIN ?
              <ProjectAdminDashboard />
              : <ProjectClientDashboard />
          }
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <Skeleton className="bg-gray-200 h-[120px] mt-4 w-full rounded-xl" />
          <Skeleton className="bg-gray-200 h-[90px] mt-4 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="bg-gray-200 h-[120px] rounded-xl" />
            <Skeleton className="bg-gray-200 h-[120px] rounded-xl" />
            <Skeleton className="bg-gray-200 h-[120px] rounded-xl" />
            <Skeleton className="bg-gray-200 h-[120px] rounded-xl" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="bg-gray-200 h-[300px] w-[48%] rounded-xl" />
            <Skeleton className="bg-gray-200 h-[300px] w-[48%] rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
