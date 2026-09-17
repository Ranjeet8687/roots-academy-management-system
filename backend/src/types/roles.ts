export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export const USER_ROLES = [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT] as const;

export type UserRoleType = typeof USER_ROLES[number];

export function isValidRole(role: string): role is UserRoleType {
  return USER_ROLES.includes(role as UserRoleType);
}