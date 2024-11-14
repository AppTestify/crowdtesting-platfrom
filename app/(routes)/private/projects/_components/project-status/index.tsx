"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProjectStausService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";

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

  const toggleStatus = async () => {
    try {
      const newStatus = !status;
      setStatus(newStatus);
      await updateProjectStausService(projectId, newStatus);
    } catch (error) {
      toasterService.error();
    }
  };
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="project-mode"
        checked={status}
        onCheckedChange={toggleStatus}
      />
      <Label htmlFor="project-mode">{status ? "Active" : "In active"}</Label>
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
