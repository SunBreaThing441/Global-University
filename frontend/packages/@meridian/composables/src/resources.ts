import { Resource } from '@meridian/api-client';

export interface LessonResourceItem {
  content_id: string;
  channel_id: string;
  contentnode_id: string;
}

export interface LessonModel {
  id: string;
  title: string;
  description: string;
  resources: LessonResourceItem[];
  active: boolean;
  collection: string; // Classroom ID
  classroom?: { id: string; name: string; parent: string };
  assignments: string[];
  learner_ids: string[];
  created_by: string;
  date_created: string;
}

export interface CoachInfo {
  id: string;
  full_name: string;
  username: string;
}

export interface ClassroomModel {
  id: string;
  name: string;
  parent: string; // Facility ID
  learner_count: number;
  coaches: CoachInfo[];
}

export interface UserProgressModel {
  content_id: string;
  progress: number; // 0.0 to 1.0
  time_spent: number; // Seconds
  completed: boolean;
  last_interaction: string;
}

// Pre-configured typed endpoints matching backend api_urls.py
export const LessonResource = new Resource<LessonModel>({
  name: 'lesson',
  namespace: 'lessons',
});

export const ClassroomResource = new Resource<ClassroomModel>({
  name: 'classroom',
  namespace: 'auth',
});

export const UserProgressResource = new Resource<UserProgressModel>({
  name: 'userprogress',
  namespace: 'logger',
});
