import { DOWNLOAD_FILE_ENDPOINT } from "../_constants/api-endpoints";
import { ProjectUserRoles } from "../_constants/project-user-roles";
import { IProject } from "../_interface/project";

export const downloadDocument = (contentType: any, base64: any, name: any) => {
  const base64String = `data:${contentType};base64,${base64}`;

  const downloadLink = document.createElement("a");

  downloadLink.href = base64String;

  downloadLink.download = `${name}`;

  downloadLink.click();
};

export const downloadFileFromDrive = async (
  fileId: string,
  fileName: string = "attachment"
) => {
  try {
    const response = await fetch(`${DOWNLOAD_FILE_ENDPOINT}/${fileId}`);

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error > getBrowserService:`, error);
    throw error;
  }
};

export function checkProjectAdmin(project: IProject, userData: any): boolean {
  const matchingUsers = Object.values(project?.users || {}).filter(
    (user: any) =>
      user.userId === userData?._id && user?.role === ProjectUserRoles.ADMIN
  );

  return matchingUsers.length === 1;
}
