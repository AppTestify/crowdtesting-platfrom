import { UserRoles } from "@/app/_constants/user-roles";
import { BarChart3, FileText, Users, Target, FlaskConical, TestTube, Play, Bug, CheckSquare, Repeat, FileBarChart, GitBranch, Settings, LucideIcon, Key } from 'lucide-react';

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
        "RTM",
        "tab access",
      ];
    case UserRoles.TESTER:
      return [
        "dashboard",
        "project details",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
        "tab access",
      ];
    case UserRoles.CROWD_TESTER:
      return [
        "dashboard",
        // "test cases",
        "test executions",
        "issues",
        "tab access",
      ];
    case UserRoles.CLIENT:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
        "RTM",
        "tab access",
      ];
    default:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "issues",
        "tasks",
        "reports",
        "tab access",
      ];
  }
};

export const getTabIconComponent = (tabLabel: string): LucideIcon => {
  const iconMap: { [key: string]: LucideIcon } = {
    "Dashboard": BarChart3,
    "Project Details": FileText,
    "Users": Users,
    "Requirements": Target,
    "Test Plans": FlaskConical,
    "Test Suites": TestTube,
    "Test Cases": CheckSquare,
    "Test Executions": Play,
    "Issues": Bug,
    "Tasks": CheckSquare,
    "Test Cycle": Repeat,
    "Reports": FileBarChart,
    "RTM": GitBranch,
    "Tab Access": Key,
  };

  return iconMap[tabLabel] || Settings;
};
