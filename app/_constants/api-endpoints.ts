export const SIGN_UP_GOOGLE_ENDPOINT = "/api/google/sign-up";
export const SIGN_IN_GOOGLE_ENDPOINT = "/api/google/sign-in";
export const SIGN_UP_ENDPOINT = "/api/sign-up";
export const SIGN_IN_ENDPOINT = "/api/sign-in";
export const FORGOT_PASSWORD_ENDPOINT = "/api/forgot-password";
export const RESET_PASSWORD_ENDPOINT = "/api/reset-password";
export const ACCOUNT_VERIFICATION_ENDPOINT = "/api/verify";
export const ACCOUNT_VERIFICATION_RESEND_ENDPOINT = "/api/verify/resend";
export const LOGOUT = "/api/logout";
export const UPDATE_ROLE = "/api/users/role";
export const DEVICES_ENDPOINT = "/api/device";
export const PROJECTS_ENDPOINT = "/api/project";
export const PAYMENTS_ENDPOINT = "/api/payment";
export const BROWSERS_ENDPOINT = "/api/browser";
export const DEVICES_BULK_DELETE_ENDPOINT = "/api/device/bulk/delete";
export const PROJECTS_BULK_DELETE_ENDPOINT = "/api/project/bulk/delete";
export const ISSUES_ENDPOINT = "/api/project/issue";
export const PROFILE_PICTURE_ENDPOINT = "/api/users/profile-picture";
export const PAYMENT_ENDPOINT = "/api/users/payment";
export const TESTER_ENDPOINT = "/api/users/testers";
export const TESTER_PROFILE_ENDPOINT = "/api/users/testers/profile";
export const FILES_ENDPOINT = "/api/users/file";
export const USERS_ENDPOINT = "/api/users";
export const USER_PASSWORD_ENDPOINT = "/api/users/password";
export const USERS_BULK_DELETE_ENDPOINT = "/api/users/bulk/delete";
export const PROJECT_USERS_ENDPOINT = "/api/project/users";
export const ADMIN_ENDPOINT = "/api/users/admin";
export const ADMIN_EMAIL_ENDPOINT = "/api/admin-email";
export const ADMIN_SELECTED_EMAIL_ENDPOINT = "/api/admin-selected-email";
export const WEBSITE_LOGO_ENDPOINT = "/api/setting/logo";
export const WEBSITE_ENDPOINT = "/api/setting/website";
export const ID_FORMAT_ENDPOINT = "/api/setting/id-format";

export const COMMENT_ENDPOINT = (projectId: string, issueId: string) => {
  return `${GET_ISSUE_ENPOINT(projectId, issueId)}/comment`;
};

export const GET_USER_ENDPOINT = (email: string) => {
  return `/api/users/${email}`;
};

export const GET_ISSUES_ENPOINT = (projectId: string) => {
  return `/api/project/${projectId}/issue`;
};

export const GET_ISSUE_ENPOINT = (projectId: string, issueId: string) => {
  return `/api/project/${projectId}/issue/${issueId}`;
};

export const GET_USER_ENPOINT = (userId: string) => {
  return `${USERS_ENDPOINT}/id/${userId}`;
};

export const PAGINATION_QUERY_ENDPOINT = (index: Number, pageSize: Number) => {
  return `?page=${index}&limit=${pageSize}`;
};

export const PROJECT_USER_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/users`;
};

export const PROJECT_REQUIREMENT_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/requirements`;
};

export const REQUIREMENT_ATTACHMENT_ENPOINT = (
  projectId: string,
  requirementId: string
) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/requirements/${requirementId}/attachment`;
};

export const TEST_SUITE_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/test-suite`;
};

export const TEST_PLAN_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/test-plan`;
};

export const TEST_CASE_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/test-case`;
};

export const TEST_CYCLE_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/test-cycle`;
};

export const TEST_CASE_STEP_ENPOINT = (
  projectId: string,
  testCaseId: string
) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/test-case/${testCaseId}`;
};

export const TEST_CASE_DATA_ENPOINT = (
  projectId: string,
  testCaseId: string
) => {
  return `${TEST_CASE_STEP_ENPOINT(projectId, testCaseId)}/test-case-data`;
};

export const NOTE_ENPOINT = (projectId: string) => {
  return `${PROJECTS_ENDPOINT}/${projectId}/note`;
};

export const MODERATE_ENDPOINT = (
  projectId: string,
  testCaseExecutionId: string
) => {
  return `/api/project/${projectId}/test-case-execution/${testCaseExecutionId}`;
};
