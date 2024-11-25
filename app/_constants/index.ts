export enum DBModels {
  USER = "User",
  TESTER = "Tester",
  DEVICE = "Device",
  BROWSER = "Browser",
  PROFILE_PICTURE = "ProfilePicture",
  PROJECT = "Project",
  REQUIREMENT = "Requirement",
  ISSUE = "Issue",
  ISSUE_ATTACHMENT = "IssueAttachment",
  TEST_SUITE = "TestSuite",
  TEST_PLAN = "TestPlan",
  TEST_CASE = "TestCase",
  TEST_CYCLE = "TestCycle",
  REQUIREMENT_ATTACHMENT = "RequirementAttachment",
  FILE = "File",
  ID_FORMAT = "IdFormat",
  COUNTER = "Counter"
}

export const JWT_TOKEN_EXPIRE_LIMIT = "8h";
export const JWT_SECRET = "smjsecret";
export const DEFAULT_PASSWORD = "$$apptestify##$$";

export enum AuthIntent {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_IN_CREDS = "SIGN_IN_CREDS",
  SIGN_UP_CREDS = "SIGN_UP_CREDS",
}
