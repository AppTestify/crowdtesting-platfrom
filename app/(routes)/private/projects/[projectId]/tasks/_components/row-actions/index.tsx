"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { deleteTaskService } from "@/app/_services/task.service";
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
import { useState } from "react";
import { EditTask } from "../edit-task";
import { ITask } from "@/app/_interface/task";
import { UserRoles } from "@/app/_constants/user-roles";
import EditTaskStatus from "../edit-task-status";
import Link from "next/link";

export function TaskRowActions({
  row,
  refreshTasks,
  onEditClick,
  userData,
}: {
  row: Row<ITask>;
  refreshTasks: () => void;
  onEditClick: (editTask: ITask) => void;
  userData: any;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const projectId = row.original.projectId;
  const taskId = row.original.id;

  const deleteTask = async () => {
    try {
      setIsLoading(true);
      const response = await deleteTaskService(projectId, taskId);

      if (response?.message) {
        setIsLoading(false);
        refreshTasks();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteTask");
    }
  };

  return (
    <>
      <EditTaskStatus
        task={row.original as ITask}
        refreshTasks={refreshTasks}
        sheetOpen={isEditStatusOpen}
        setSheetOpen={setIsEditStatusOpen}
      />

      {/* <EditTask
        refreshTasks={refreshTasks}
        task={row.original as ITask}
        sheetOpen={isEditOpen}
        setSheetOpen={setIsEditOpen}
      /> */}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete task"
        description="Are you sure you want delete this task?"
        isLoading={isLoading}
        successAction={deleteTask}
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
          <Link href={`/private/browse/${projectId}/task/${row.original?.id}`}>
            <DropdownMenuItem
              className="mb-1"
              onClick={() => {
                setIsViewOpen(true);
              }}
            >
              <Eye className="h-2 w-2" /> View
            </DropdownMenuItem>
          </Link>
          {row?.original?.assignedTo?._id === userData?._id ? (
            <>
              <DropdownMenuSeparator className="border-b" />
              <DropdownMenuItem
                className="mb-1"
                onClick={() => {
                  setIsEditStatusOpen(true);
                }}
              >
                <Edit className="h-2 w-2" /> Edit
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuSeparator className="border-b" />
              <DropdownMenuItem
                className="mb-1"
                onClick={() => {
                  onEditClick(row.original);
                  setIsEditOpen(true);
                }}
              >
                <Edit className="h-2 w-2" /> Edit
              </DropdownMenuItem>
            </>
          )}
          {/* <DropdownMenuSeparator className="border-b" />
                    <DropdownMenuItem
                        className="mb-1"
                        onClick={() => {
                            setIsEditOpen(true);
                        }}
                    >
                        <Edit className="h-2 w-2" /> Edit
                    </DropdownMenuItem> */}
          {userData?.role != UserRoles.TESTER && (
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
