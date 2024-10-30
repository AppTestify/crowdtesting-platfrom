import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProjectStausService } from "@/app/_services/project.service";

export function SwitchProject({
  isActive,
  projectId,
  refreshProjects,
}: {
  isActive: boolean;
}) {
  const [status, setStatus] = useState(isActive);

  const toggleStatus = async () => {
    try {
      const newStatus = !status; // Toggle the current status
      setStatus(newStatus); // Update the local state
      await updateProjectStausService(projectId,newStatus);
      // toast({ title: `Project is now ${!status ? "active" : "inactive"}.` });
      refreshProjects(); // Fetches updated project data after change
    } catch (error) {
      console.error("Error updating project status:", error);
      // toast({ title: "Error", description: "Failed to update project status.", variant: "destructive" });
    }
  };
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="project-mode"
        checked={status}
        onCheckedChange={toggleStatus}
      />
      <Label htmlFor="project-mode">{isActive ? "Active" : "Inactive"}</Label>
    </div>
  );
}

const ProjectStatus = ({
  status,
  projectId,
  refreshProjects,
}: {
  status: boolean;
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
