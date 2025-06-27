import AssigneeUser from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/assignee-user';
import DeviceChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/devices-chart';
import HorizontalBarChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/horizontal-bar-chart';
import { getDashboardClientService } from '@/app/_services/dashboard.service';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { Activity, Bug, CheckCircle, Clock, AlertTriangle, Users, Target, BarChart3, TrendingUp, Download, FileText } from 'lucide-react';
import { exportDashboardToPDF } from '@/lib/pdf-export';

// Simple Progress component
const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}>
        <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);

export default function ProjectClientDashboard() {
    const [dashboard, setDashboard] = useState<any>();
    const [project, setProject] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const getClientDashboard = async () => {
        try {
            setIsLoading(true);
            const response = await getDashboardClientService(projectId);
            setDashboard(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const getProject = async () => {
        try {
            const response = await getProjectService(projectId);
            setProject(response);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    useEffect(() => {
        getClientDashboard();
        getProject();
    }, [projectId]);

    // Function to handle PDF export
    const handlePDFExport = async () => {
        try {
            setIsExporting(true);
            
            // Prepare project data using the main project data
            const projectData = {
                title: project?.title || 'Project Dashboard',
                description: project?.description || 'Comprehensive project analytics and metrics',
                status: project?.isActive ? 'Active' : 'Inactive',
                startDate: project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A',
                endDate: project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
                clientName: project?.clientName || 'N/A'
            };

            // Prepare dashboard data
            const dashboardData = {
                totalIssues: dashboard?.totalIssues || 0,
                totalTestCases: dashboard?.totalTestCases || 0,
                totalTestCycles: dashboard?.totalTestCycle || 0,
                criticalIssues: criticalIssues,
                status: dashboard?.status || {},
                task: dashboard?.task || {},
                testCaseType: dashboard?.testCaseType || {},
                testCaseSeverity: dashboard?.testCaseSeverity || {},
                topDevices: dashboard?.topDevices || {},
                requirementStatus: dashboard?.requirementStatus || {},
                assignedIssueCounts: dashboard?.assignedIssueCounts || [],
                assignedRequirementCounts: dashboard?.assignedRequirementCounts || []
            };

            await exportDashboardToPDF(projectData, dashboardData);
            toasterService.success('PDF report generated successfully!');
            
        } catch (error) {
            console.error('Export error:', error);
            toasterService.error('Failed to generate PDF report');
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate metrics
    const totalItems = (dashboard?.totalIssues || 0) + (dashboard?.totalTestCases || 0);
    const completedIssues = dashboard?.status?.["CLOSED"] + dashboard?.status?.["VERIFIED"] || 0;
    const completionRate = totalItems > 0 ? Math.round((completedIssues / totalItems) * 100) : 0;
    const criticalIssues = dashboard?.severity?.["CRITICAL"] + dashboard?.severity?.["BLOCKER"] || 0;
    const activeTesters = Object.keys(dashboard?.assignedIssueCounts || {}).length;

    return (
        <div className="space-y-8 pb-8">
            {!isLoading && (
                <>
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
                            <p className="text-muted-foreground mt-1">Comprehensive dashboard for project monitoring and insights</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handlePDFExport}
                                disabled={isExporting || isLoading}
                                variant="outline"
                                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export PDF
                                    </>
                                )}
                            </Button>
                            <Badge variant="outline" className="text-sm px-3 py-1">
                                <Activity className="w-4 h-4 mr-2" />
                                Live Metrics
                            </Badge>
                        </div>
                    </div>

                    {/* Key Performance Indicators - Enhanced Layout */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-pdf-section="kpi-cards">
                        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-indigo-800">Active Issues</CardTitle>
                                <div className="p-2 bg-indigo-200 rounded-full">
                                    <Bug className="h-5 w-5 text-indigo-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-indigo-900">{dashboard?.totalIssues || 0}</div>
                                <p className="text-xs text-indigo-600 mt-2 font-medium">Tracked & managed</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-emerald-800">Test Suite</CardTitle>
                                <div className="p-2 bg-emerald-200 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-emerald-900">{dashboard?.totalTestCases || 0}</div>
                                <p className="text-xs text-emerald-600 mt-2 font-medium">Comprehensive coverage</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-violet-800">Test Cycles</CardTitle>
                                <div className="p-2 bg-violet-200 rounded-full">
                                    <Clock className="h-5 w-5 text-violet-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-violet-900">{dashboard?.totalTestCycle || 0}</div>
                                <p className="text-xs text-violet-600 mt-2 font-medium">Execution rounds</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-rose-800">Priority Issues</CardTitle>
                                <div className="p-2 bg-rose-200 rounded-full">
                                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-rose-900">{criticalIssues}</div>
                                <p className="text-xs text-rose-600 mt-2 font-medium">Needs attention</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Project Health Overview - Improved Layout */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2" data-pdf-section="progress-overview">
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Project Health
                                </CardTitle>
                                <CardDescription>Overall quality and completion metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Completion Progress</span>
                                        <span className="text-primary font-bold">{completionRate}%</span>
                                    </div>
                                    <Progress value={completionRate} className="h-3" />
                                    <div className="text-xs text-muted-foreground text-center">
                                        {completedIssues} of {totalItems} items completed
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                        <p className="text-xs text-green-600 font-medium">Resolved</p>
                                        <p className="text-2xl font-bold text-green-700 mt-1">{completedIssues}</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                                        <p className="text-xs text-amber-600 font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-amber-700 mt-1">{totalItems - completedIssues}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Team Insights
                                </CardTitle>
                                <CardDescription>Team engagement and productivity metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                        <div className="text-3xl font-bold text-blue-600">{activeTesters}</div>
                                        <div className="text-xs text-blue-600 font-medium mt-1">Active Testers</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                                        <div className="text-3xl font-bold text-purple-600">{Object.keys(dashboard?.assignedRequirementCounts || {}).length}</div>
                                        <div className="text-xs text-purple-600 font-medium mt-1">Contributors</div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-center">
                                    Team productivity and engagement metrics
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Issue Analytics - Enhanced alignment and UI */}
                    <div className="space-y-6" data-pdf-section="issue-analysis">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Issue Analytics</h2>
                                <p className="text-sm text-muted-foreground">Comprehensive analysis of issue patterns and trends</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900">Severity Analysis</CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Critical vs non-critical issue distribution</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="severity"
                                            chartData={dashboard?.severity || {}}
                                            projectId={projectId}
                                            entity={"Severity"}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900">Priority Matrix</CardTitle>
                                        <CardDescription className="text-sm text-gray-600">High, medium, low priority breakdown</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="priority"
                                            chartData={dashboard?.priority || {}}
                                            projectId={projectId}
                                            entity={"Priority"}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900">Issue Categories</CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Functional, UI/UX, and other issue types</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="issueType"
                                            chartData={dashboard?.issueType || {}}
                                            projectId={projectId}
                                            entity={"IssueType"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Status - Enhanced alignment */}
                    <div className="space-y-6" data-pdf-section="status-progress">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Workflow Status</h2>
                                <p className="text-sm text-muted-foreground">Current status and progress tracking</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Issue Lifecycle
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Comprehensive view of current issue statuses</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="status"
                                            chartData={dashboard?.status || {}}
                                            projectId={projectId}
                                            entity={"Status"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Task Pipeline
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Comprehensive view of task progress stages</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="task"
                                            chartData={dashboard?.task || {}}
                                            projectId={projectId}
                                            entity={"Task"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Quality Assurance - Improved alignment */}
                    <div className="space-y-6" data-pdf-section="testing-overview">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Quality Assurance</h2>
                                <p className="text-sm text-muted-foreground">Test coverage and quality metrics</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            Test Case Portfolio
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Distribution of automated, manual, and integration tests</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="testCaseType"
                                            chartData={dashboard?.testCaseType || {}}
                                            projectId={projectId}
                                            entity={"TestCaseType"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            Test Criticality
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Test case priority distribution</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="testCaseSeverity"
                                            chartData={dashboard?.testCaseSeverity || {}}
                                            projectId={projectId}
                                            entity={"Severity"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Technical Insights - Enhanced visual hierarchy */}
                    <div className="space-y-6" data-pdf-section="technical-insights">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Technical Insights</h2>
                                <p className="text-sm text-muted-foreground">Device coverage and requirements analysis</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                            Device Coverage
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Testing across different devices and platforms</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="h-[280px] overflow-hidden">
                                            <DeviceChart
                                                title=""
                                                description=""
                                                dataKey="device"
                                                chartData={dashboard?.topDevices || {}}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            Requirement Tracking
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Feature requirements and their completion status</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="requirementStatus"
                                            chartData={dashboard?.requirementStatus || {}}
                                            projectId={projectId}
                                            entity={"RequirementStatus"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Resource Allocation - Enhanced Spacing */}
                    <div className="space-y-6" data-pdf-section="team-workload">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">Resource Allocation</h2>
                                <p className="text-sm text-muted-foreground">Team workload and assignment distribution</p>
                            </div>
                        </div>
                        
                        <div className='grid gap-6 lg:grid-cols-2'>
                            <div className="lg:col-span-1">
                                <AssigneeUser 
                                    assignedUser={dashboard?.assignedIssueCounts} 
                                    title='Issue Distribution' 
                                    description='Current workload distribution across team members' 
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <AssigneeUser 
                                    assignedUser={dashboard?.assignedRequirementCounts} 
                                    title='Requirement Ownership' 
                                    description='Feature requirements assigned to team members' 
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
