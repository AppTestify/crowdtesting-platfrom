"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IIssue } from "@/app/_interface/issue";
import { deleteIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import ViewIssue from "../view-issue";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import EditIssueStatus from "../edit-issue-status";
import Link from "next/link";
import { useParams } from "next/navigation";

export function IssueRowActions({
  row,
  refreshIssues,
  onEditClick,
}: {
  row: Row<IIssue>;
  refreshIssues: () => void;
  onEditClick: (issues: IIssue) => void;
}) {
  // const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();
  const { projectId } = useParams<{ projectId: string }>();
  const issueId = row.original.id as string;

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  const deleteIssue = async () => {
    try {
      setIsLoading(true);
      const response = await deleteIssueService(projectId, issueId);

      if (response?.message) {
        setIsLoading(false);
        refreshIssues();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteIssue");
    }
  };

  // Check if user can edit this issue (crowd testers cannot edit any issues)
  const canEditIssue = () => {
    if (userData?.role === UserRoles.CROWD_TESTER) {
      return false; // Crowd testers cannot edit any issues
    }
    return true; // Other roles can edit any issue
  };

  return (
    <>
      {/* <EditIssue
        issue={row.original as IIssue}
        sheetOpen={isEditOpen}
        setSheetOpen={setIsEditOpen}
        refreshIssues={refreshIssues}
      /> */}

      <EditIssueStatus
        issue={row.original as IIssue}
        sheetOpen={isEditStatusOpen}
        setSheetOpen={setIsEditStatusOpen}
        refreshIssues={refreshIssues}
      />

      <ViewIssue
        issue={row.original as IIssue}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete Issue"
        description="Are you sure you want delete this issue?"
        isLoading={isLoading}
        successAction={deleteIssue}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/private/browse/${projectId}/issue/${issueId}`}>
            <DropdownMenuItem className="mb-1">
              <Eye className="h-2 w-2" /> View
            </DropdownMenuItem>
          </Link>
          {canEditIssue() && (
            <>
              <DropdownMenuSeparator className="border-b" />
              <DropdownMenuItem
                className="mb-1"
                onClick={() => {
                  onEditClick(row.original);
                }}
              >
                <Edit className="h-2 w-2" /> Edit
              </DropdownMenuItem>
            </>
          )}
          {userData?.role != UserRoles.TESTER && userData?.role != UserRoles.CROWD_TESTER && (
            <>
              <DropdownMenuSeparator className="border-b" />
              <DropdownMenuItem
                className="my-1"
                onClick={() => {
                  setIsDeleteOpen(true);
                  setIsLoading(false);
                }}
              >
                <Trash className="h-2 w-2 text-destructive" />{" "}
                <span className="text-destructive">Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
