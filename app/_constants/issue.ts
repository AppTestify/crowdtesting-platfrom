export const enum Severity {
  MINOR = "Minor",
  MAJOR = "Major",
  CRITICAL = "Critical",
}

export const enum Priority {
  LOW = "Low",
  NORMAL = "Normal",
  HIGH = "High",
}

export const enum IssueStatus {
  NEW = "New",
  FIXED = "Fixed",
  DUPLICATE = "Duplicate",
  INVALID = "Invalid",
  DEFERRED = "Deferred",
  RETEST_FAILED = "Retest failed",
  RETEST_PASSED = "Retest passed"
}

export const SEVERITY_LIST = [
  Severity.MINOR,
  Severity.MAJOR,
  Severity.CRITICAL,
];

export const PRIORITY_LIST = [Priority.LOW, Priority.NORMAL, Priority.HIGH];

export const ISSUE_STATUS_LIST = [
  IssueStatus.NEW,
  IssueStatus.FIXED,
  IssueStatus.DUPLICATE,
  IssueStatus.INVALID,
  IssueStatus.DEFERRED,
  IssueStatus.RETEST_FAILED,
  IssueStatus.RETEST_PASSED
];

export const ISSUE_TESTER_STATUS_LIST = [
  IssueStatus.RETEST_FAILED,
  IssueStatus.RETEST_PASSED
];