import "server-only";
import { UserRoles } from "./user-roles";

export const VERIFICATION_LINK_EXPIRE_LIMIT = 7;
export const CUSTOM_ID_KEY = "customId";
export const CUSTOM_ID_REGEX = /{customId}/g;
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const enum AttachmentFolder {
  USERS = "users",
  ISSUES = "issues",
  REQUIREMENTS = "requirements",
  SYSTEM = "system",
  REPORT = "report",
  PROFILE_PICTURES = "profile-pictures",
  TEST_CYCLE = "test-cycle",
  INVOICE = "invoice",
  TEST_CASE = "test-case",
  TEST_CASE_DATA = "test-case-data",
  TEST_CASE_RESULT = "test-case-result",
}

export const publicEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
];

const enum TabLabels {
  DASHBOARD = "Dashboard",
  PROJECT_DETAILS = "Project Details",
  USERS = "Users",
  REQUIREMENTS = "Requirements",
  TEST_PLANS = "Test Plans",
  TEST_SUITES = "Test Suites",
  TEST_CASES = "Test Cases",
  TEST_EXECUTIONS = "Test Executions",
  ISSUES = "Issues",
  TASKS = "Tasks",
  TEST_CYCLE = "Test Cycle",
  REPORTS = "Reports",
  RTM = "RTM",
}

export const defaultTabsAccess = [
  {
    label: TabLabels.DASHBOARD,
    key: "DASHBOARD",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.PROJECT_DETAILS,
    key: "PROJECT_DETAILS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.USERS,
    key: "USERS",
    roles: [
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.REQUIREMENTS,
    key: "REQUIREMENTS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TEST_PLANS,
    key: "TEST_PLANS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TEST_SUITES,
    key: "TEST_SUITES",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TEST_CASES,
    key: "TEST_CASES",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TEST_EXECUTIONS,
    key: "TEST_EXECUTIONS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.ISSUES,
    key: "ISSUES",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TASKS,
    key: "TASKS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.TEST_CYCLE,
    key: "TEST_CYCLE",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.REPORTS,
    key: "REPORTS",
    roles: [
      UserRoles.TESTER,
      UserRoles.CROWD_TESTER,
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
  {
    label: TabLabels.RTM,
    key: "RTM",
    roles: [
      UserRoles.ADMIN,
      UserRoles.CLIENT,
      UserRoles.MANAGER,
      UserRoles.DEVELOPER,
      UserRoles.PROJECT_ADMIN,
    ],
  },
];
