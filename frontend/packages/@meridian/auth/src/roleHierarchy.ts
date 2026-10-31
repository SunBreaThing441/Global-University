import { UserKind, RoleLevel } from './types';

export const ROLE_LEVEL_MAP: Record<UserKind, RoleLevel> = {
  [UserKind.SUPERUSER]: RoleLevel.SUPERUSER,
  [UserKind.ADMIN]: RoleLevel.ADMIN,
  [UserKind.COACH]: RoleLevel.FACILITY_COACH,
  [UserKind.ASSIGNABLE_COACH]: RoleLevel.CLASS_COACH,
  [UserKind.LEARNER]: RoleLevel.LEARNER,
  [UserKind.ANONYMOUS]: RoleLevel.ANONYMOUS,
};

/**
 * Computes the highest effective role level held by a user based on their roles array.
 */
export function getHighestRoleLevel(roles: UserKind[]): RoleLevel {
  if (!roles || roles.length === 0 || roles.includes(UserKind.ANONYMOUS)) {
    return RoleLevel.ANONYMOUS;
  }
  return roles.reduce((max, role) => {
    const level = ROLE_LEVEL_MAP[role] ?? RoleLevel.ANONYMOUS;
    return level > max ? level : max;
  }, RoleLevel.ANONYMOUS);
}

/**
 * Checks if the user's role level satisfies or exceeds the minimum required level.
 */
export function hasMinimumRole(userRoles: UserKind[], requiredLevel: RoleLevel): boolean {
  return getHighestRoleLevel(userRoles) >= requiredLevel;
}
