import type { Role, Staff } from "@/types";
import { create } from "zustand";

export const ROLE_LABELS: Record<Role, string> = {
  teacher: "Teacher",
  coTeacher: "Co-Teacher",
  student: "Student",
  parent: "Parent / Guardian",
  schoolAdmin: "School Admin",
  departmentHead: "Department Head",
  principal: "Principal",
  districtAdmin: "District Admin",
  counsellor: "Counsellor",
  spedCoordinator: "SPED Coordinator",
  curriculumCoordinator: "Curriculum Coordinator",
  substitute: "Substitute",
};

export const ROLE_DEFAULT_PATHS: Record<Role, string> = {
  teacher: "/teacher/today",
  coTeacher: "/co-teacher/today",
  student: "/student/today",
  parent: "/parent/children",
  schoolAdmin: "/school-admin/dashboard",
  departmentHead: "/department-head/dashboard",
  principal: "/principal/morning-picture",
  districtAdmin: "/district-admin/district-dashboard",
  counsellor: "/counsellor/caseload",
  spedCoordinator: "/sped/iep-caseload",
  curriculumCoordinator: "/curriculum/courses",
  substitute: "/substitute/todays-classes",
};

const DEMO_USERS: Record<Role, Staff> = {
  teacher: {
    id: "staff-1",
    firstName: "Maria",
    lastName: "Chen",
    roles: ["teacher"],
    email: "mchen@lincoln.edu",
    subjects: ["Mathematics"],
    department: "Math",
  },
  coTeacher: {
    id: "staff-2",
    firstName: "James",
    lastName: "Okafor",
    roles: ["coTeacher"],
    email: "jokafor@lincoln.edu",
    subjects: ["Mathematics"],
    department: "Math",
  },
  student: {
    id: "student-demo",
    firstName: "Alex",
    lastName: "Rivera",
    roles: ["student"],
    email: "arivera@lincoln.edu",
  },
  parent: {
    id: "parent-1",
    firstName: "Sandra",
    lastName: "Rivera",
    roles: ["parent"],
    email: "srivera@home.com",
  },
  schoolAdmin: {
    id: "staff-3",
    firstName: "Patricia",
    lastName: "Nguyen",
    roles: ["schoolAdmin"],
    email: "pnguyen@lincoln.edu",
  },
  departmentHead: {
    id: "staff-4",
    firstName: "Robert",
    lastName: "Kim",
    roles: ["departmentHead", "teacher"],
    email: "rkim@lincoln.edu",
    department: "Science",
  },
  principal: {
    id: "staff-5",
    firstName: "Diana",
    lastName: "Walsh",
    roles: ["principal"],
    email: "dwalsh@lincoln.edu",
  },
  districtAdmin: {
    id: "staff-6",
    firstName: "Marcus",
    lastName: "Thompson",
    roles: ["districtAdmin"],
    email: "mthompson@district.edu",
  },
  counsellor: {
    id: "staff-7",
    firstName: "Sophia",
    lastName: "Martinez",
    roles: ["counsellor"],
    email: "smartinez@lincoln.edu",
  },
  spedCoordinator: {
    id: "staff-8",
    firstName: "David",
    lastName: "Patel",
    roles: ["spedCoordinator"],
    email: "dpatel@lincoln.edu",
  },
  curriculumCoordinator: {
    id: "staff-9",
    firstName: "Laura",
    lastName: "Johnson",
    roles: ["curriculumCoordinator"],
    email: "ljohnson@lincoln.edu",
  },
  substitute: {
    id: "staff-10",
    firstName: "Kevin",
    lastName: "Brooks",
    roles: ["substitute"],
    email: "kbrooks@lincoln.edu",
  },
};

interface RoleStore {
  currentRole: Role;
  currentUser: Staff | null;
  isDevMode: boolean;
  setRole: (role: Role) => void;
  /**
   * Apply the role derived from the authenticated account (server-side). Only
   * the owner keeps the "View as" switcher (isDevMode); other accounts are
   * pinned to their one real role.
   */
  setAuthenticatedRole: (role: Role, isOwner: boolean) => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  currentRole: "teacher",
  currentUser: DEMO_USERS.teacher,
  // Demo mode (role-switcher / "View as") while unauthenticated. Real auth
  // pins non-owner accounts to their one role via setAuthenticatedRole.
  isDevMode: true,
  setRole: (role) => {
    set({ currentRole: role, currentUser: DEMO_USERS[role] });
  },
  setAuthenticatedRole: (role, isOwner) => {
    set({
      currentRole: role,
      currentUser: DEMO_USERS[role],
      isDevMode: isOwner,
    });
  },
}));

export { DEMO_USERS };
