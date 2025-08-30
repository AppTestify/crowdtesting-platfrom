import { getDashboardAdminService } from "@/app/_services/dashboard.service";
import toasterService from "@/app/_services/toaster-service";
import React, { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HorizontalBarChart from "../client-dashboard/_components/horizontal-bar-chart";
import PieCharts from "../client-dashboard/_components/pie-chart";
import DeviceChart from "../client-dashboard/_components/devices-chart";
import { DonutChart } from "../client-dashboard/_components/donut-chart";
import StatusBarChart from "../client-dashboard/_components/bar-chart";
import AssigneeUser from "../client-dashboard/_components/assignee-user";
import { Users, FolderOpen, AlertTriangle, Activity, TrendingUp, Shield, Database, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dashboard, setDashboard] = useState<any>({});

    const getDashboard = async () => {
        try {
            setIsLoading(true);
            // Get comprehensive data for all projects (super admin view)
            const response = await getDashboardAdminService();
            setDashboard(response || {});
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
            toasterService.error("Failed to load dashboard data");
            setDashboard({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getDashboard();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Comprehensive overview of all system data</p>
                        </div>
                    </div>
                    
                    {/* Summary Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Projects</p>
                                    <p className="text-3xl font-bold mt-1">{dashboard?.totalProjects || 0}</p>
                                </div>
                                <FolderOpen className="h-8 w-8 text-green-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                    <p className="text-3xl font-bold mt-1">{dashboard?.totalUsers || 0}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Active Users</p>
                                    <p className="text-3xl font-bold mt-1">{dashboard?.activeUsers || 0}</p>
                                </div>
                                <Activity className="h-8 w-8 text-purple-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Total Issues</p>
                                    <p className="text-3xl font-bold mt-1">{dashboard?.totalIssues || 0}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-200" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 - User Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-blue-600" />
                                Users by Role
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">User distribution across roles</p>
                        </div>
                        <div className="p-6">
                            <HorizontalBarChart
                                title=""
                                description=""
                                dataKey="role"
                                chartData={dashboard?.userRoles || {}}
                                projectId={""}
                                entity={"Role"}
                                isDropdown={false}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                                Projects by Status
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Project status distribution</p>
                        </div>
                        <div className="p-6">
                            <HorizontalBarChart
                                title=""
                                description=""
                                dataKey="status"
                                chartData={dashboard?.projectStatus || {}}
                                projectId={""}
                                entity={"Status"}
                                isDropdown={false}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                                User Activity
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Online vs offline users</p>
                        </div>
                        <div className="p-6">
                            <PieCharts
                                title=""
                                description=""
                                chartData={dashboard?.userActivity || {}}
                                dataKey="activity"
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 - Issue & Status Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                Issues by Type
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Issue type distribution</p>
                        </div>
                        <div className="p-6">
                            <DonutChart 
                                chartData={dashboard?.issueType || {}} 
                                dataKey={"issueType"} 
                                title={"Issue Type"}
                                description={"Showing issue type levels across all projects"}
                                headerTitle={"Issue by type"} 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-amber-600" />
                                User Status
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Active vs inactive users</p>
                        </div>
                        <div className="p-6">
                            <DonutChart 
                                chartData={dashboard?.userStatus || {}} 
                                dataKey={"status"} 
                                title={"User Status"}
                                description={"Showing user status levels across all projects"}
                                headerTitle={"Users by status"} 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Database className="h-5 w-5 mr-2 text-teal-600" />
                                Project Types
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Web, mobile, desktop projects</p>
                        </div>
                        <div className="p-6">
                            <DonutChart 
                                chartData={dashboard?.projectType || {}} 
                                dataKey={"type"} 
                                title={"Project Type"}
                                description={"Showing project type levels across all projects"}
                                headerTitle={"Projects by type"} 
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row 3 - Device & Severity Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                                Device Usage
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Desktop, mobile, tablet usage</p>
                        </div>
                        <div className="p-6">
                            <DonutChart 
                                chartData={dashboard?.deviceUsage || {}} 
                                dataKey={"device"} 
                                title={"Device Usage"}
                                description={"Showing device usage levels across all projects"}
                                headerTitle={"Device usage"} 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-rose-600" />
                                Issues by Severity
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Critical, high, medium, low</p>
                        </div>
                        <div className="p-6">
                            <HorizontalBarChart
                                title=""
                                description=""
                                dataKey="severity"
                                chartData={dashboard?.severity || {}}
                                entity={"Severity"}
                                isDropdown={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row 4 - Device & Status Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                                Top Devices
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Most used devices across projects</p>
                        </div>
                        <div className="p-6">
                            <DeviceChart
                                title=""
                                description=""
                                dataKey="device"
                                chartData={dashboard?.topDevices || {}}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2 text-violet-600" />
                                Issues by Status
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Issue status distribution</p>
                        </div>
                        <div className="p-6">
                            <StatusBarChart
                                title=""
                                description=""
                                chartData={dashboard?.status || {}}
                                dataKey="status"
                            />
                        </div>
                    </div>
                </div>

                {/* User Assignment Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-blue-600" />
                                Issues Assignment
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Issues assigned to users</p>
                        </div>
                        <div className="p-6">
                            <AssigneeUser 
                                assignedUser={dashboard?.assignedIssueCounts || []} 
                                title="" 
                                description="" 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                                Projects Assignment
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Projects assigned to users</p>
                        </div>
                        <div className="p-6">
                            <AssigneeUser 
                                assignedUser={dashboard?.assignedProjectCounts || []} 
                                title="" 
                                description="" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
