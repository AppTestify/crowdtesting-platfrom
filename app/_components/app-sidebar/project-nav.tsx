"use client";

import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProjectTabs, getTabIconComponent } from '@/app/_components/project-layout/_constants';
import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService, updateProjectTabAccessService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { UserRoles } from '@/app/_constants/user-roles';
import { ChevronLeft, FileText, ChevronRight, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectNavProps {
  onNavClick?: () => void;
}

export function ProjectNav({ onNavClick }: ProjectNavProps) {
  const { data } = useSession();
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProjectPayload>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accessTabs, setAccessTabs] = useState<any>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop();
  const { setOpen } = useSidebar();

  const getProject = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectService(projectId);
      setAccessTabs(response?.projectTabAccess?.tabAccess);

      if (response) {
        setProject(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, [projectId]);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  const handleTabClick = (tabValue: string) => {
    if (tabValue === 'tab-access') {
      // Don't navigate, just open the popup
      return;
    }
    router.push(`/private/projects/${projectId}/${tabValue}`);
    onNavClick?.();
  };

  const handleCheckboxChange = async (tab: any, isChecked: boolean) => {
    const updatedTabs = accessTabs.map((t: any) =>
      t._id === tab._id ? { ...t, access: isChecked } : t
    );

    setAccessTabs(updatedTabs);
    try {
      const response = await updateProjectTabAccessService(projectId, tab._id, { access: isChecked });
      if (response) {
        toasterService.success(response.message);
        await getProject();
      }
    } catch (error) {
      console.error("handleCheckboxChange", error);
    }
  };

  // Function to extract text content from HTML strings
  const extractTextContent = (htmlString: string): string => {
    if (!htmlString) return '';
    return htmlString
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  if (isLoading || !project) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const projectTitle = extractTextContent(project?.title || '');

  return (
    <div className="space-y-4">
      {/* Project Header - Similar to the image */}
      <div className="px-2">
        {/* Project Name Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {projectTitle}
              </h3>
              <p className="text-xs text-gray-500">Project</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        {/* Back to Projects Button */}
        <Link 
          href="/private/projects"
          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mb-4 bg-gray-50 border border-gray-200"
          onClick={onNavClick}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Navigation Tabs - Clean format like the image */}
      <div className="space-y-1 px-2">
        {/* Use getProjectTabs for all roles to ensure Tab Access shows */}
        {getProjectTabs(userData)?.map((tab: string, index: number) => {
          const tabValue = tab === "RTM" ? "RTM" : tab.toLowerCase().replace(/ /g, '-');
          const isActive = activeTab === tabValue;
          const IconComponent = getTabIconComponent(tab.charAt(0).toUpperCase() + tab.slice(1));
          
          // Handle Tab Access specially
          if (tab === "tab access") {
            return (
              <Popover key={index}>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          )}
                        >
                          <IconComponent className="h-4 w-4 text-gray-600" />
                          <span>Tab Access</span>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Configure tab visibility and access permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PopoverContent className="w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl bg-white border border-gray-200" align="start">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings2 className="h-5 w-5 text-gray-700" />
                      <h3 className="font-semibold text-gray-900">Tab Access Control</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage which tabs are visible to team members
                    </p>
                    
                    <div className="space-y-3">
                      {accessTabs?.map((tabItem: any, tabIndex: number) => {
                        const TabIconComponent = getTabIconComponent(tabItem.label);
                        return (
                          <div
                            key={tabIndex}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors duration-150"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50">
                                <TabIconComponent className="h-4 w-4 text-blue-600" />
                              </div>
                              <Label 
                                htmlFor={`checkbox-${tabIndex}`} 
                                className="font-medium text-gray-800 cursor-pointer"
                              >
                                {tabItem.label}
                              </Label>
                            </div>
                            <Checkbox
                              id={`checkbox-${tabIndex}`}
                              className="h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              checked={tabItem?.access}
                              onCheckedChange={(isChecked) => handleCheckboxChange(tabItem, isChecked as boolean)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }
          
          return (
            <button
              key={index}
              onClick={() => handleTabClick(tabValue)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <IconComponent className={cn(
                "h-4 w-4",
                isActive ? "text-blue-600" : "text-gray-500"
              )} />
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
