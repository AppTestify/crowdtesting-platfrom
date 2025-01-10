"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProjectStausService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";

export function SwitchProject({
  isActive,
  projectId,
  refreshProjects,
}: {
  isActive: boolean;
  projectId: string;
  refreshProjects: () => void;
}) {
  const [status, setStatus] = useState(isActive);
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    setStatus(isActive);
  }, [isActive]);

  const toggleStatus = async () => {
    try {
      const newStatus = !status;
      setStatus(newStatus);
      const response = await updateProjectStausService(projectId, newStatus);
      if (response) {
        refreshProjects();
      }
    } catch (error) {
      toasterService.error();
    }
  };
  return (
    <div className="flex items-center space-x-2">
      <Switch
        disabled={userData?.role !== UserRoles.ADMIN}
        id="project-mode"
        checked={status}
        onCheckedChange={toggleStatus}
      />
      <Label htmlFor="project-mode">{status ? "Active" : "Inactive"}</Label>
    </div>
  );
}

const ProjectStatus = ({
  status,
  projectId,
  refreshProjects,
}: {
  status: boolean;
  projectId: string;
  refreshProjects: () => void;
}) => {
  return (
    <div>
      <SwitchProject
        isActive={status}
        projectId={projectId}
        refreshProjects={refreshProjects}
      />
    </div>
  );
};

export default ProjectStatus;
