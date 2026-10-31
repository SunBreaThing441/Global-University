import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { UserKind, RoleLevel } from '@meridian/auth';
import { getHighestRoleLevel, hasMinimumRole } from '@meridian/auth/roleHierarchy';

describe('Hierarchical RBAC Security Engine', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('correctly calculates hierarchical role levels', () => {
    expect(getHighestRoleLevel([UserKind.ANONYMOUS])).toBe(RoleLevel.ANONYMOUS);
    expect(getHighestRoleLevel([UserKind.LEARNER])).toBe(RoleLevel.LEARNER);
    expect(getHighestRoleLevel([UserKind.ASSIGNABLE_COACH])).toBe(RoleLevel.CLASS_COACH);
    expect(getHighestRoleLevel([UserKind.COACH])).toBe(RoleLevel.FACILITY_COACH);
    expect(getHighestRoleLevel([UserKind.ADMIN])).toBe(RoleLevel.ADMIN);
    expect(getHighestRoleLevel([UserKind.SUPERUSER])).toBe(RoleLevel.SUPERUSER);
  });

  it('strictly restricts learners from coach and admin routes', () => {
    const learnerRoles = [UserKind.LEARNER];

    // Learners satisfy learner level
    expect(hasMinimumRole(learnerRoles, RoleLevel.LEARNER)).toBe(true);

    // Learners are rejected from Coach, Facility Coach, and Admin
    expect(hasMinimumRole(learnerRoles, RoleLevel.CLASS_COACH)).toBe(false);
    expect(hasMinimumRole(learnerRoles, RoleLevel.FACILITY_COACH)).toBe(false);
    expect(hasMinimumRole(learnerRoles, RoleLevel.ADMIN)).toBe(false);
  });

  it('allows coaches to access coach routes but blocks from admin routes', () => {
    const coachRoles = [UserKind.COACH];

    expect(hasMinimumRole(coachRoles, RoleLevel.LEARNER)).toBe(true);
    expect(hasMinimumRole(coachRoles, RoleLevel.CLASS_COACH)).toBe(true);
    expect(hasMinimumRole(coachRoles, RoleLevel.FACILITY_COACH)).toBe(true);
    expect(hasMinimumRole(coachRoles, RoleLevel.ADMIN)).toBe(false);
  });

  it('grants facility admin and superuser unrestricted access across all tiers', () => {
    const adminRoles = [UserKind.ADMIN];
    const superuserRoles = [UserKind.SUPERUSER];

    [adminRoles, superuserRoles].forEach((roles) => {
      expect(hasMinimumRole(roles, RoleLevel.LEARNER)).toBe(true);
      expect(hasMinimumRole(roles, RoleLevel.CLASS_COACH)).toBe(true);
      expect(hasMinimumRole(roles, RoleLevel.FACILITY_COACH)).toBe(true);
      expect(hasMinimumRole(roles, RoleLevel.ADMIN)).toBe(true);
    });
  });
});
