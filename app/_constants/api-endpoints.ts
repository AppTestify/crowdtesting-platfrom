export const SIGN_UP_GOOGLE_ENDPOINT = "/api/google/sign-up";
export const SIGN_IN_GOOGLE_ENDPOINT = "/api/google/sign-in";
export const SIGN_UP_ENDPOINT = "/api/sign-up";
export const SIGN_IN_ENDPOINT = "/api/sign-in";
export const LOGOUT = "/api/logout";
export const UPDATE_ROLE = "/api/users/role";

export const GET_USER_ENDPOINT = (email: string) => {
  return `/api/users/${email}`;
};
