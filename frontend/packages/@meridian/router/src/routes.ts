import { RouteRecordRaw } from 'vue-router';
import { RoleLevel } from '@meridian/auth';
import {
  SignInView,
  DashboardDispatcher,
  LearnerDashboardView,
  CoachDashboardView,
  AdminDashboardView,
  UserProfileView,
  UnauthorizedView,
} from '@meridian/views';

export const routes: RouteRecordRaw[] = [
  {
    path: '/signin',
    name: 'SignIn',
    component: SignInView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/dashboard',
    name: 'DashboardDispatcher',
    component: DashboardDispatcher,
    meta: {
      requiresAuth: true,
      minimumRole: RoleLevel.LEARNER,
    },
  },
  {
    path: '/dashboard/learner',
    name: 'LearnerDashboard',
    component: LearnerDashboardView,
    meta: {
      requiresAuth: true,
      minimumRole: RoleLevel.LEARNER,
    },
  },
  {
    path: '/dashboard/coach',
    name: 'CoachDashboard',
    component: CoachDashboardView,
    meta: {
      requiresAuth: true,
      minimumRole: RoleLevel.CLASS_COACH, // Enforces Class Coach and above
    },
  },
  {
    path: '/dashboard/admin',
    name: 'AdminDashboard',
    component: AdminDashboardView,
    meta: {
      requiresAuth: true,
      minimumRole: RoleLevel.ADMIN, // Enforces Facility Admin and Superuser
    },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfileView,
    meta: {
      requiresAuth: true,
      minimumRole: RoleLevel.LEARNER, // Available to all authenticated members
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: UnauthorizedView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];
