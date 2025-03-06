export enum UserRoles {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  TESTER = "TESTER",
  PROJECT_ADMIN = "PROJECT ADMIN",
  MANAGER = "MANAGER",
  DEVELOPER = "DEVELOPER",
}

export const USER_ROLE_LIST = [
  UserRoles.PROJECT_ADMIN,
  UserRoles.CLIENT,
  UserRoles.TESTER,
  UserRoles.MANAGER,
  UserRoles.DEVELOPER,
];
