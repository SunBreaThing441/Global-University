export enum UserKind {
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
  COACH = 'coach',
  ASSIGNABLE_COACH = 'classroom assignable coach',
  LEARNER = 'learner',
  ANONYMOUS = 'anonymous',
}

export enum RoleLevel {
  ANONYMOUS = 0,
  LEARNER = 1,
  CLASS_COACH = 2,
  FACILITY_COACH = 3,
  ADMIN = 4,
  SUPERUSER = 5,
}

export interface UserSessionData {
  id?: string;
  user_id?: string | null;
  username: string;
  full_name: string;
  facility_id?: string | null;
  kind: UserKind[];
  can_manage_content: boolean;
  full_facility_import: boolean;
  app_context?: boolean;
  server_time?: string;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
  facility?: string;
  auth_token?: string;
  picture_password?: string;
}

export interface RouteSecurityMeta {
  requiresAuth?: boolean;
  minimumRole?: RoleLevel;
  allowedRoles?: UserKind[];
  requiresContentManagement?: boolean;
  guestOnly?: boolean;
}
