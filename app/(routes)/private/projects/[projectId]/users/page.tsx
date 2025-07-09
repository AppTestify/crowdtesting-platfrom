"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import {
  getProjectService,
  getProjectUsersPaginationService,
} from "@/app/_services/project.service";
import { AddProjectUser } from "./add-user";
import { ProjectUserRowActions } from "./row-actions";
import { IProject, IProjectUserDisplay } from "@/app/_interface/project";
import { statusBadgeProjectUserRole } from "@/app/_utils/common-functionality";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import ExpandableTable from "@/app/_components/expandable-table";
import { DBModels } from "@/app/_constants";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { checkProjectAdmin } from "@/app/_utils/common";
import toasterService from "@/app/_services/toaster-service";
import UserVerify from "./user-verify";
import EditProjectUser from "./edit-user";
import {
  Users,
  UserCheck,
  UserX,
  Globe,
  MapPin,
  Search,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Languages,
  Award,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddClientUser } from "./add-client-user";
import { AssignClientUserToProject } from "./assign-client-user";

export default function ProjectUsers() {
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    uniqueCountries: 0,
    uniqueCities: 0,
    totalSkills: 0,
    totalLanguages: 0,
  });

  const projectAdmin = checkProjectAdmin(project as IProject, userData);

  const columns: ColumnDef<IProjectUserDisplay>[] = [
    {
      accessorFn: (row) => row.userId?.firstName || row.userId?.lastName || "",
      accessorKey: "userName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <Users className="mr-2 h-4 w-4" />
          Tester
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const firstName = row?.original?.userId?.firstName;
        const lastName = row?.original?.userId?.lastName;
        const initials = `${firstName?.charAt(0) || ""}${
          lastName?.charAt(0) || ""
        }`.toUpperCase();
        const displayName = `${firstName || ""} ${lastName || ""}`.trim();

        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-muted">
                {initials || "T"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {displayName || "No Name"}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {row.original?.userId?.customId || "N/A"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorFn: (row) =>
        row?.tester?.skills
          ?.filter((skill) => skill.trim() !== "")
          .join(", ") || "",
      accessorKey: "skills",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <Award className="mr-2 h-4 w-4" />
          Skills
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const skills = row.original?.tester?.skills;
        const filteredSkills = skills
          ?.filter((skill) => skill.trim() !== "")
          .map((skill) => ({ name: skill }));
        return (
          <div className="max-w-[200px]">
            <ExpandableTable row={filteredSkills as any[]} />
          </div>
        );
      },
    },
    {
      accessorFn: (row) =>
        row.tester?.languages
          ?.filter((lang) => lang.name.trim() !== "")
          .map((lang) => lang.name)
          .join(", ") || "",
      accessorKey: "language",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <Languages className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Languages</span>
          <span className="sm:hidden">Lang</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          <ExpandableTable row={row.original.tester?.languages as any[]} />
        </div>
      ),
      filterFn: (row, columnId, filterValue) => {
        const languages = row.original?.tester?.languages || [];
        return languages.some((language) =>
          language?.name?.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
    {
      accessorFn: (row) => row.role || "",
      accessorKey: "projectUserRole",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <Shield className="mr-2 h-4 w-4" />
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {statusBadgeProjectUserRole(row.original?.role)}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.tester?.address?.city || "",
      accessorKey: "city",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <MapPin className="mr-2 h-4 w-4" />
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize truncate max-w-[100px]">
            {row.original?.tester?.address?.city || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.tester?.address?.country || "",
      accessorKey: "country",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/50"
        >
          <Globe className="mr-2 h-4 w-4" />
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize truncate max-w-[100px]">
            {row.original?.tester?.address?.country || "N/A"}
          </span>
        </div>
      ),
    },
    ...(projectAdmin === true || userData?.role === UserRoles.ADMIN
      ? [
          {
            accessorKey: "verify",
            header: "Status",
            cell: ({ row }: { row: any }) => {
              const isVerify = row.original?.isVerify ?? true;
              return (
                <div className="flex items-center">
                  <UserVerify
                    status={isVerify}
                    id={row.original._id as string}
                    projectId={projectId as string}
                    refreshProjectUsers={refreshProjectUsers}
                  />
                </div>
              );
            },
          },
        ]
      : []),
    ...(userData?.role === UserRoles.ADMIN
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <ProjectUserRowActions
                row={row}
                onEditClick={(editUsers) => {
                  setEditUser(editUsers);
                  setIsEditOpen(true);
                }}
                projectId={projectId}
                refreshProjectUsers={refreshProjectUsers}
              />
            ),
          },
        ]
      : []),
  ];

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<IProjectUserDisplay | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.USER) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [projectUsers, setProjectUsers] = useState<IProjectUserDisplay[]>([]);
  const [allProjectUsers, setAllProjectUsers] = useState<IProjectUserDisplay[]>(
    []
  );
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();

  // Responsive column visibility
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setColumnVisibility({
        language: width >= 1024, // Hide on smaller screens
        city: width >= 768,
        country: width >= 1200,
        skills: width >= 640,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePreviousPage = () => {
    if (pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalPageCount / pageSize);
    if (pageIndex < maxPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem("entity", DBModels.PROJECT_USERS);
    getProject();
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getProjectUsers();
      getAllProjectUsers();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    getAllProjectUsers();
  }, []);

  const calculateStats = (users: IProjectUserDisplay[]) => {
    const verifiedUsers = users.filter(
      (user) => (user as any).isVerify !== false
    ).length;
    const unverifiedUsers = users.length - verifiedUsers;

    const countries = new Set(
      users.map((user) => user.tester?.address?.country).filter(Boolean)
    );
    const cities = new Set(
      users.map((user) => user.tester?.address?.city).filter(Boolean)
    );

    const allSkills = new Set();
    const allLanguages = new Set();

    users.forEach((user) => {
      user.tester?.skills?.forEach((skill) => {
        if (skill.trim()) allSkills.add(skill.trim());
      });
      user.tester?.languages?.forEach((lang) => {
        if (lang.name.trim()) allLanguages.add(lang.name.trim());
      });
    });

    setStats({
      totalUsers: users.length,
      verifiedUsers,
      unverifiedUsers,
      uniqueCountries: countries.size,
      uniqueCities: cities.size,
      totalSkills: allSkills.size,
      totalLanguages: allLanguages.size,
    });
  };

  const getProjectUsers = async () => {
    setIsLoading(true);
    try {
      const projectUsers = await getProjectUsersPaginationService(
        projectId,
        pageIndex,
        pageSize
      );
      const users = projectUsers?.data?.users || [];
      setProjectUsers(users);
      setTotalPageCount(projectUsers?.data?.total || 0);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all project users for dashboard stats
  const getAllProjectUsers = async () => {
    try {
      const response = await getProjectUsersPaginationService(
        projectId,
        1, // page 1
        999999 // large page size to get all
      );
      const allUsers = response?.data?.users || [];
      setAllProjectUsers(allUsers);
      calculateStats(allUsers);
    } catch (error) {
      setAllProjectUsers([]);
    }
  };

  const getProject = async () => {
    setIsStatsLoading(true);
    try {
      const response = await getProjectService(projectId);
      setProject(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsStatsLoading(false);
    }
  };

  const refreshProjectUsers = () => {
    getProjectUsers();
    getAllProjectUsers();
    setRowSelection({});
  };

  const refreshStats = () => {
    getProjectUsers();
    getAllProjectUsers();
  };

  const table = useReactTable({
    data: projectUsers,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const totalPages = Math.ceil(totalPageCount / pageSize);

  if (!userData) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px] bg-gray-200" />
            <Skeleton className="h-4 w-[400px] bg-gray-200" />
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 bg-gray-200" />
              ))}
            </div>
            <Skeleton className="h-64 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {editUser && (
          <EditProjectUser
            projectUser={editUser as IProjectUserDisplay}
            sheetOpen={isEditOpen}
            setSheetOpen={setIsEditOpen}
            refreshProjectUsers={refreshProjectUsers}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              Project Team Members
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {project?.title
                ? `Manage team members for "${project.title}"`
                : "Manage project team members and their roles"}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={isLoading || isStatsLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading || isStatsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            {userData?.role === UserRoles.ADMIN && (
              <AddProjectUser refreshProjectUsers={refreshProjectUsers} />
            )}

            {userData?.role === UserRoles.CLIENT && (
              <div className="flex items-center space-x-2">
                <AddClientUser refreshUsers={refreshProjectUsers} />
                <AssignClientUserToProject refreshProjectUsers={refreshProjectUsers} />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Verified
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.verifiedUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0
                  ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
                  : 0}
                % verified
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Global Reach
              </CardTitle>
              <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.uniqueCountries}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueCities} cities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Skills & Languages
              </CardTitle>
              <Award className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats.totalSkills}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLanguages} languages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription className="mt-1">
                  Manage project team members, their roles, and verification
                  status
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {stats.verifiedUsers} verified
                </Badge>
                {stats.unverifiedUsers > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {stats.unverifiedUsers} pending
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    table.setGlobalFilter(String(event.target.value));
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <Table className="table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-b"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              "bg-muted/50 font-semibold text-foreground",
                              header.id === "userName" && "min-w-[200px]",
                              header.id === "skills" && "min-w-[150px]",
                              header.id === "language" && "min-w-[120px]",
                              header.id === "projectUserRole" && "w-32",
                              header.id === "city" && "w-28",
                              header.id === "country" && "w-32",
                              header.id === "verify" && "w-24",
                              header.id === "actions" && "w-20"
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        {columnVisibility.skills && (
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        )}
                        {columnVisibility.language && (
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        )}
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        {columnVisibility.city && (
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                        )}
                        {columnVisibility.country && (
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        )}
                        {(projectAdmin ||
                          userData?.role === UserRoles.ADMIN) && (
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                        )}
                        {userData?.role === UserRoles.ADMIN && (
                          <TableCell>
                            <Skeleton className="h-4 w-8" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No team members found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Add team members to get started
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPageCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pageIndex - 1) * pageSize + 1} to{" "}
                  {Math.min(pageIndex * pageSize, totalPageCount)} of{" "}
                  {totalPageCount} members
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={pageIndex === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Page {pageIndex} of {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={pageIndex >= totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
