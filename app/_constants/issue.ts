export const enum Severity {
  MINOR = "Minor",
  MAJOR = "Major",
  CRITICAL = "Critical",
  BLOCKER = "Blocker",
}

export const enum Priority {
  LOW = "Low",
  NORMAL = "Normal",
  HIGH = "High",
}

export const enum IssueType {
  FUNCTIONAL = "Functional",
  UI_UX = "UI/UX",
  USABILITY = "Usability",
  PERFORMANCE = "Performance",
  SECURITY = "Security",
}

export const enum IssueStatus {
  NEW = "New",
  OPEN = "Open",
  ASSIGNED = "Assigned",
  IN_PROGRESS = "In progress",
  FIXED = "Fixed",
  READY_FOR_RETEST = "Ready for retest",
  RETESTING = "Retesting",
  VERIFIED = "Verified",
  CLOSED = "Closed",
  REOPENED = "Reopened",
  DEFERRED = "Deferred",
  DUPLICATE = "Duplicate",
  REJECTED = "Rejected",
  CANNOT_REPRODUCE = "Cannot reproduce",
  NOT_A_BUG = "Not a bug",
  BLOCKED = "Blocked",
}

export const ISSUE_STATUS_LIST = [
  IssueStatus.NEW,
  IssueStatus.OPEN,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.FIXED,
  IssueStatus.READY_FOR_RETEST,
  IssueStatus.RETESTING,
  IssueStatus.VERIFIED,
  IssueStatus.CLOSED,
  IssueStatus.REOPENED,
  IssueStatus.DEFERRED,
  IssueStatus.DUPLICATE,
  IssueStatus.REJECTED,
  IssueStatus.CANNOT_REPRODUCE,
  IssueStatus.NOT_A_BUG,
  IssueStatus.BLOCKED,
];

export const ISSUE_TYPE_LIST = [
  IssueType.FUNCTIONAL,
  IssueType.UI_UX,
  IssueType.USABILITY,
  IssueType.PERFORMANCE,
  IssueType.SECURITY,
];

export const SEVERITY_LIST = [
  Severity.MINOR,
  Severity.MAJOR,
  Severity.CRITICAL,
  Severity.BLOCKER,
];

export const PRIORITY_LIST = [Priority.LOW, Priority.NORMAL, Priority.HIGH];

export const PROJECT_ADMIN_ISSUE_STATUS_LIST = [
  IssueStatus.OPEN,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.FIXED,
  IssueStatus.READY_FOR_RETEST,
  IssueStatus.RETESTING,
  IssueStatus.VERIFIED,
  IssueStatus.CLOSED,
  IssueStatus.REOPENED,
  IssueStatus.DEFERRED,
  IssueStatus.DUPLICATE,
  IssueStatus.REJECTED,
  IssueStatus.CANNOT_REPRODUCE,
  IssueStatus.NOT_A_BUG,
];

export const ISSUE_TESTER_STATUS_LIST = [
  IssueStatus.RETESTING,
  IssueStatus.VERIFIED,
  IssueStatus.OPEN,
];
