export const SIGN_UP_GOOGLE_ENDPOINT = "/api/google/sign-up";
export const SIGN_IN_GOOGLE_ENDPOINT = "/api/google/sign-in";
export const SIGN_UP_ENDPOINT = "/api/sign-up";
export const SIGN_IN_ENDPOINT = "/api/sign-in";
export const ACCOUNT_VERIFICATION_ENDPOINT = "/api/verify";
export const ACCOUNT_VERIFICATION_RESEND_ENDPOINT = "/api/verify/resend";
export const LOGOUT = "/api/logout";
export const UPDATE_ROLE = "/api/users/role";
export const DEVICES_ENDPOINT = "/api/device";
export const PROJECTS_ENDPOINT = "/api/project";
export const BROWSERS_ENDPOINT = "/api/browser";
export const DEVICES_BULK_DELETE_ENDPOINT = "/api/device/bulk/delete";
export const PROJECTS_BULK_DELETE_ENDPOINT = "/api/project/bulk/delete";
export const ISSUES_ENDPOINT = "/api/issue";
export const ISSUES_PROJECT_ENDPOINT = "/api/issue/project";

export const GET_USER_ENDPOINT = (email: string) => {
  return `/api/users/${email}`;
};
