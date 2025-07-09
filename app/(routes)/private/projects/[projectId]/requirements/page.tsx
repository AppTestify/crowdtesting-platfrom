"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  Row,
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
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { getRequirementsService, exportRequirementsService } from "@/app/_services/requirement.service";
import { formatDistanceToNow } from "date-fns";
import { AddRequirement } from "./_components/add-requirement";
import { RequirementRowActions } from "./_components/row-actions";
import { IRequirement } from "@/app/_interface/requirement";
import ViewRequirement from "./_components/view-requirement";
import { ArrowUpDown, Search, Filter, Grid3X3, List, Plus, FileText, Users, Calendar, ChevronLeft, ChevronRight, Trello, Download, FileSpreadsheet, FileText as FileTextIcon, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import {
  checkProjectActiveRole,
  taskStatusBadge,
  ExportExcelFile,
} from "@/app/_utils/common-functionality";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import EditRequirement from "./_components/edit-requirement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateRequirementService } from "@/app/_services/requirement.service";
import { TASK_STATUS_LIST } from "@/app/_constants/issue";
import { generateExcelFile } from "@/app/_helpers/generate-excel.helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Requirements() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();
  
  const [requirements, setRequirements] = useState<IRequirement[]>([]);
  const [allRequirements, setAllRequirements] = useState<IRequirement[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  
  // Modal states
  const [requirement, setRequirement] = useState<IRequirement | null>(null);
  const [editRequirement, setEditRequirement] = useState<IRequirement | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Handle status update for Kanban board
  const handleStatusUpdate = useCallback(async (requirementId: string, newStatus: string) => {
    try {
      const requirement = requirements.find(r => r.id === requirementId);
      if (!requirement) return;

      const payload = {
        title: requirement.title,
        description: requirement.description,
        status: newStatus,
        assignedTo: requirement.assignedTo?._id || requirement.assignedTo?.id,
        startDate: requirement.startDate,
        endDate: requirement.endDate,
        projectId: projectId
      };

      await updateRequirementService(projectId, requirementId, payload);
      
      // Update local state
      setRequirements(prev => 
        prev.map(req => 
          req.id === requirementId 
            ? { ...req, status: newStatus }
            : req
        )
      );
      
      toasterService.success('Requirement status updated successfully');
    } catch (error) {
      toasterService.error('Failed to update requirement status');
    }
  }, [requirements, projectId]);

  // Filter requirements based on search and status
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = !searchTerm || 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requirements, searchTerm, statusFilter]);

  // Group requirements by status for Kanban view - use filtered requirements
  const groupedRequirements = useMemo(() => {
    return TASK_STATUS_LIST.reduce((acc, status) => {
      acc[status] = filteredRequirements.filter(req => req.status === status);
      return acc;
    }, {} as Record<string, IRequirement[]>);
  }, [filteredRequirements]);

  // Enhanced columns with better styling
  const columns: ColumnDef<IRequirement>[] = useMemo(() => [
    {
      accessorKey: "customId",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">ID</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className="text-blue-600 cursor-pointer ml-4 font-mono font-semibold hover:text-blue-800 transition-colors"
          onClick={() => getRequirement(row.original as IRequirement)}
        >
          #{row.getValue("customId")}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: () => <span className="font-semibold text-gray-700">Title</span>,
      cell: ({ row }) => (
        <div
          className="font-medium hover:text-blue-600 cursor-pointer transition-colors max-w-[300px]"
          onClick={() => getRequirement(row.original as IRequirement)}
        >
          <div className="truncate">{row.getValue("title")}</div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {row.original.description?.replace(/<[^>]*>/g, '').substring(0, 100)}...
          </div>
        </div>
      ),
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
          {
            accessorKey: "createdBy",
            header: () => <span className="font-semibold text-gray-700">Reporter</span>,
            cell: ({ row }: { row: any }) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {`${row.original?.userId?.firstName?.[0] || ''}${row.original?.userId?.lastName?.[0] || ''}`}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {`${row.original?.userId?.firstName || ""} ${
                      row.original?.userId?.lastName || ""
                    }`}
                  </div>
                  <div className="text-xs text-gray-500">{row.original?.userId?.email}</div>
                </div>
              </div>
            ),
          },
        ]
      : []),
    ...(Array.isArray(requirements) &&
    requirements?.some((item) => item.assignedTo?._id)
      ? [
          {
            accessorKey: "assignedTo",
            header: () => <span className="font-semibold text-gray-700">Assignee</span>,
            cell: ({ row }: { row: any }) => (
              <div className="flex items-center gap-2">
                {row.original?.assignedTo?._id ? (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {userData?.role === UserRoles.ADMIN ? 
                        `${row.original?.assignedTo?.firstName?.[0] || ''}${row.original?.assignedTo?.lastName?.[0] || ''}` : 
                        row.original?.assignedTo?.customId?.[0]
                      }
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {userData?.role === UserRoles.ADMIN ? (
                          `${
                            row.original?.assignedTo?.firstName ||
                            NAME_NOT_SPECIFIED_ERROR_MESSAGE
                          } ${row.original?.assignedTo?.lastName || ""}`
                        ) : (
                          row.original?.assignedTo?.customId
                        )}
                      </div>
                      {userData?.role === UserRoles.ADMIN && (
                        <div className="text-xs text-gray-500">{row.original?.assignedTo?.email}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "updatedAt",
      header: () => <span className="font-semibold text-gray-700">Last Updated</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            {formatDistanceToNow(new Date(row.getValue("updatedAt")), {
              addSuffix: true,
            })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <span className="font-semibold text-gray-700">Status</span>,
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          {taskStatusBadge(row.getValue("status"))}
        </div>
      ),
    },
    ...(userData?.role != UserRoles.TESTER && userData?.role != UserRoles.CROWD_TESTER &&
    checkProjectActiveRole(project?.isActive ?? false, userData)
      ? [
          {
            id: "actions",
            enableHiding: false,
            header: () => <span className="font-semibold text-gray-700">Actions</span>,
            cell: ({ row }: { row: any }) => (
              <RequirementRowActions
                row={row as Row<IRequirement>}
                onViewClick={(viewReq) => {
                  setRequirement(viewReq);
                  setIsViewOpen(true);
                }}
                onEditClick={(editReq) => {
                  setEditRequirement(editReq);
                  setIsEditOpen(true);
                }}
                refreshRequirements={refreshRequirements}
              />
            ),
          },
        ]
      : []),
  ], [userData, requirements, project]);

  const table = useReactTable({
    data: filteredRequirements,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
    pageCount: -1,
  });

  const getRequirement = useCallback(async (data: IRequirement) => {
    setRequirement(data);
    setIsViewOpen(true);
  }, []);

  const getProject = useCallback(async () => {
    try {
      const response = await getProjectService(projectId);
      if (response) {
        setProject(response.project || response);
      }
    } catch (error) {
      toasterService.error();
    }
  }, [projectId]);

  const getRequirements = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRequirementsService(projectId, pageIndex, pageSize, searchTerm);
      if (response) {
        setRequirements(response.requirements || []);
        setTotalPageCount(response.total || 0);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }, [projectId, pageIndex, pageSize, searchTerm]);

  // Fetch all requirements for dashboard stats
  const getAllRequirements = useCallback(async () => {
    try {
      const response = await getRequirementsService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        "" // no search filter for stats
      );
      if (response) {
        setAllRequirements(response.requirements || []);
      }
    } catch (error) {
      setAllRequirements([]);
    }
  }, [projectId]);

  const refreshRequirements = useCallback(() => {
    getRequirements();
    getAllRequirements();
  }, [getRequirements, getAllRequirements]);

  // useEffect hooks
  useEffect(() => {
    if (data) {
      setUserData(data.user);
    }
  }, [data]);

  useEffect(() => {
    if (projectId) {
      getProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      const debounceFetch = setTimeout(() => {
        getRequirements();
        getAllRequirements();
      }, 500);
      return () => clearTimeout(debounceFetch);
    }
  }, [projectId, pageIndex, pageSize, searchTerm]);

  useEffect(() => {
    getAllRequirements();
  }, [getAllRequirements]);

  const handlePreviousPage = () => {
    if (pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < totalPageCount) {
      setPageIndex(pageIndex + 1);
    }
  };

  // Update stats to use filtered data when filters are applied
  const statsData = (searchTerm || statusFilter !== 'all') ? filteredRequirements : allRequirements;
  const stats = useMemo(() => ({
    total: statsData.length,
    completed: statsData.filter(r => r.status === 'Done').length,
    inProgress: statsData.filter(r => r.status === 'In progress').length,
    pending: statsData.filter(r => r.status === 'To do').length,
  }), [statsData]);

  const exportExcel = async () => {
    setIsExcelLoading(true);
    try {
      const response = await exportRequirementsService(projectId, 'excel');
      if (response && response.data) {
        const headers = response.headers;
        const data = response.data.map((req: any) => [
          req.id,
          req.title,
          req.description,
          req.status,
          req.createdBy,
          req.assignedTo,
          req.assignedToEmail,
          req.startDate,
          req.endDate,
          req.createdAt,
          req.updatedAt,
          req.attachmentsCount,
          req.attachments
        ]);
        
        generateExcelFile(
          headers,
          data,
          `Requirements-${project?.title || 'Export'}-${new Date().toISOString().split('T')[0]}.xlsx`
        );
        
        toasterService.success('Requirements exported to Excel successfully');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      toasterService.error('Failed to export requirements to Excel');
    } finally {
      setIsExcelLoading(false);
    }
  };

  const exportCsv = async () => {
    setIsCsvLoading(true);
    try {
      await exportRequirementsService(projectId, 'csv');
      toasterService.success('Requirements exported to CSV successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toasterService.error('Failed to export requirements to CSV');
    } finally {
      setIsCsvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Requirements
              </h1>
              <p className="text-gray-600 mt-2">Manage and track project requirements</p>
            </div>
            {userData?.role != UserRoles.TESTER && userData?.role != UserRoles.CROWD_TESTER &&
              checkProjectActiveRole(project?.isActive ?? false, userData) && (
                <AddRequirement refreshRequirements={refreshRequirements} />
              )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gray-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="To do">Pending</SelectItem>
                  <SelectItem value="In progress">In Progress</SelectItem>
                  <SelectItem value="Done">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filter indicator */}
              {(searchTerm || statusFilter !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
                  <Filter className="h-4 w-4" />
                  <span>
                    {filteredRequirements.length} of {requirements.length} requirements
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="flex items-center gap-2"
              >
                <Trello className="h-4 w-4" />
                Kanban
              </Button>
              
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportExcel} disabled={isExcelLoading}>
                    {isExcelLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv} disabled={isCsvLoading}>
                    {isCsvLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileTextIcon className="h-4 w-4 mr-2" />
                    )}
                    Export to CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {viewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-b border-gray-200">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="px-6 py-4">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-64 text-center"
                          >
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-gray-600">Loading requirements...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="px-6 py-4">
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
                            className="h-64 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <FileText className="h-12 w-12 text-gray-300 mb-4" />
                              <p className="text-gray-500 text-lg font-medium">No requirements found</p>
                              <p className="text-gray-400 text-sm mt-1">Get started by creating your first requirement</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredRequirements.length ? (
                filteredRequirements.map((req) => (
                  <Card 
                    key={req.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                    onClick={() => getRequirement(req)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                          #{req.customId}
                        </Badge>
                        {taskStatusBadge(req.status)}
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {req.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-3 text-gray-600 mb-4">
                        {req.description?.replace(/<[^>]*>/g, '')}
                      </CardDescription>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(req.updatedAt), { addSuffix: true })}
                        </div>
                        {req.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="truncate max-w-[100px]">
                              {req.assignedTo.firstName} {req.assignedTo.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-xl font-medium">No requirements found</p>
                  <p className="text-gray-400 text-sm mt-1">Get started by creating your first requirement</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                {TASK_STATUS_LIST.map((status) => (
                  <Card key={status} className="bg-gray-50 border-2 border-dashed border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'Done' ? 'bg-green-500' :
                            status === 'In progress' ? 'bg-yellow-500' :
                            status === 'Blocked' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          {status}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {groupedRequirements[status]?.length || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="space-y-3 min-h-[500px]"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                        
                        const requirementId = e.dataTransfer.getData('text/plain');
                        const currentStatus = requirements.find(r => r.id === requirementId)?.status;
                        
                        if (currentStatus !== status) {
                          handleStatusUpdate(requirementId, status);
                        }
                      }}
                    >
                      {groupedRequirements[status]?.map((requirement) => (
                        <Card 
                          key={requirement.id}
                          className="cursor-move hover:shadow-md transition-shadow bg-white border border-gray-200"
                          draggable={userData?.role !== UserRoles.TESTER && userData?.role !== UserRoles.CROWD_TESTER && checkProjectActiveRole(project?.isActive ?? false, userData)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', requirement.id);
                            e.currentTarget.classList.add('opacity-50');
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.classList.remove('opacity-50');
                          }}
                          onClick={() => getRequirement(requirement)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                                #{requirement.customId}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {requirement.assignedTo && (
                                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {userData?.role === UserRoles.ADMIN ? 
                                      `${requirement.assignedTo.firstName?.[0] || ''}${requirement.assignedTo.lastName?.[0] || ''}` : 
                                      requirement.assignedTo.customId?.[0]
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                              {requirement.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs text-gray-600 line-clamp-3 mb-3">
                              {requirement.description?.replace(/<[^>]*>/g, '')}
                            </CardDescription>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(requirement.updatedAt), { addSuffix: true })}
                              </div>
                              {userData?.role !== UserRoles.TESTER && userData?.role !== UserRoles.CROWD_TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) && (
                                <div 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <RequirementRowActions
                                    row={{ original: requirement } as Row<IRequirement>}
                                    onViewClick={(viewReq) => {
                                      setRequirement(viewReq);
                                      setIsViewOpen(true);
                                    }}
                                    onEditClick={(editReq) => {
                                      setEditRequirement(editReq);
                                      setIsEditOpen(true);
                                    }}
                                    refreshRequirements={refreshRequirements}
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {groupedRequirements[status]?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <FileText className="h-8 w-8 mb-2" />
                          <p className="text-sm">No requirements</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Kanban Instructions */}
              {userData?.role !== UserRoles.TESTER && userData?.role !== UserRoles.CROWD_TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Trello className="h-4 w-4" />
                      <p className="text-sm font-medium">Drag and drop requirements between columns to update their status</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Pagination - Update to use React Table pagination for table view */}
          {viewMode === 'table' && table.getPageCount() > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Server-side pagination for grid and kanban when no filters are applied */}
          {viewMode !== 'table' && !searchTerm && statusFilter === 'all' && totalPageCount > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {pageIndex} of {totalPageCount}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pageIndex === totalPageCount}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {requirement && (
        <ViewRequirement
          requirement={requirement}
          sheetOpen={isViewOpen}
          setSheetOpen={setIsViewOpen}
          refreshRequirements={refreshRequirements}
          readOnly={true}
        />
      )}

      {editRequirement && (
        <EditRequirement
          requirement={editRequirement}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
          refreshRequirements={refreshRequirements}
        />
      )}
    </div>
  );
}
