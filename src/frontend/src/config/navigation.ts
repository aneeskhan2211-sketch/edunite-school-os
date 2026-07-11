import type { NavConfig, Role } from "@/types";

export const NAV_CONFIGS: Record<Role, NavConfig> = {
  teacher: {
    defaultPath: "/teacher/today",
    primary: [
      {
        id: "today",
        label: "Today",
        icon: "CalendarDays",
        path: "/teacher/today",
      },
      {
        id: "students",
        label: "Students",
        icon: "GraduationCap",
        path: "/teacher/students",
      },
      {
        id: "classes",
        label: "Classes",
        icon: "Users",
        path: "/teacher/classes",
      },
      {
        id: "curriculum",
        label: "Curriculum",
        icon: "BookMarked",
        path: "/curriculum/courses",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/teacher/messages",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/teacher/reports",
      },
      {
        id: "community",
        label: "Community",
        icon: "Newspaper",
        path: "/community",
      },
    ],
  },
  coTeacher: {
    defaultPath: "/co-teacher/today",
    primary: [
      {
        id: "today",
        label: "Today",
        icon: "CalendarDays",
        path: "/co-teacher/today",
      },
      {
        id: "classes",
        label: "Classes",
        icon: "Users",
        path: "/co-teacher/classes",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/co-teacher/messages",
      },
    ],
  },
  student: {
    defaultPath: "/student/today",
    primary: [
      {
        id: "today",
        label: "Today",
        icon: "CalendarDays",
        path: "/student/today",
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: "FileText",
        path: "/student/assignments",
      },
      {
        id: "grades",
        label: "Grades",
        icon: "TrendingUp",
        path: "/student/grades",
      },
      {
        id: "schedule",
        label: "Schedule",
        icon: "Clock",
        path: "/student/schedule",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/student/messages",
      },
      {
        id: "community",
        label: "Community",
        icon: "Newspaper",
        path: "/community",
      },
    ],
  },
  parent: {
    defaultPath: "/parent/children",
    primary: [
      {
        id: "children",
        label: "Children",
        icon: "Heart",
        path: "/parent/children",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/parent/messages",
      },
      {
        id: "events",
        label: "Events",
        icon: "CalendarDays",
        path: "/parent/events",
      },
      {
        id: "conferences",
        label: "Conferences",
        icon: "Video",
        path: "/parent/conferences",
      },
      {
        id: "community",
        label: "Community",
        icon: "Newspaper",
        path: "/community",
      },
    ],
  },
  schoolAdmin: {
    defaultPath: "/school-admin/dashboard",
    primary: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: "/school-admin/dashboard",
      },
      {
        id: "enrolment",
        label: "Enrolment",
        icon: "UserPlus",
        path: "/school-admin/enrolment",
      },
      {
        id: "staff",
        label: "Staff",
        icon: "Briefcase",
        path: "/school-admin/staff",
      },
      {
        id: "timetables",
        label: "Timetables",
        icon: "Clock",
        path: "/school-admin/timetables",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/school-admin/reports",
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        path: "/school-admin/settings",
      },
    ],
  },
  departmentHead: {
    defaultPath: "/department-head/dashboard",
    primary: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: "/department-head/dashboard",
      },
      {
        id: "department",
        label: "Department",
        icon: "BookMarked",
        path: "/department-head/department",
      },
      {
        id: "teachers",
        label: "Teachers",
        icon: "Users",
        path: "/department-head/teachers",
      },
      {
        id: "curriculum",
        label: "Curriculum",
        icon: "AlignLeft",
        path: "/department-head/curriculum-alignment",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/department-head/reports",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/department-head/messages",
      },
    ],
  },
  principal: {
    defaultPath: "/principal/morning-picture",
    primary: [
      {
        id: "morning-picture",
        label: "Morning Picture",
        icon: "Sunrise",
        path: "/principal/morning-picture",
      },
      {
        id: "needs-attention",
        label: "Needs Attention",
        icon: "AlertCircle",
        path: "/principal/needs-attention",
      },
      {
        id: "early-warning",
        label: "Early Warning",
        icon: "ShieldAlert",
        path: "/early-warning",
      },
      {
        id: "behaviour",
        label: "Behaviour",
        icon: "AlertTriangle",
        path: "/principal/behaviour",
      },
      { id: "staff", label: "Staff", icon: "Users", path: "/principal/staff" },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/principal/reports",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/principal/messages",
      },
    ],
  },
  districtAdmin: {
    defaultPath: "/district-admin/district-dashboard",
    primary: [
      {
        id: "district-dashboard",
        label: "District Dashboard",
        icon: "Globe",
        path: "/district-admin/district-dashboard",
      },
      {
        id: "schools",
        label: "Schools",
        icon: "Building2",
        path: "/district-admin/schools",
      },
      {
        id: "patterns",
        label: "Patterns",
        icon: "Activity",
        path: "/district-admin/patterns",
      },
      {
        id: "benchmarks",
        label: "Benchmarks",
        icon: "Target",
        path: "/district-admin/benchmarks",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/district-admin/reports",
      },
    ],
  },
  counsellor: {
    defaultPath: "/counsellor/caseload",
    primary: [
      {
        id: "caseload",
        label: "Caseload",
        icon: "Users",
        path: "/counsellor/caseload",
      },
      {
        id: "needs-attention",
        label: "Needs Attention",
        icon: "AlertCircle",
        path: "/counsellor/needs-attention",
      },
      {
        id: "early-warning",
        label: "Early Warning",
        icon: "ShieldAlert",
        path: "/early-warning",
      },
      {
        id: "interventions",
        label: "Interventions",
        icon: "Stethoscope",
        path: "/counsellor/interventions",
      },
      {
        id: "appointments",
        label: "Appointments",
        icon: "CalendarDays",
        path: "/counsellor/appointments",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/counsellor/messages",
      },
    ],
  },
  spedCoordinator: {
    defaultPath: "/sped/iep-caseload",
    primary: [
      {
        id: "iep-caseload",
        label: "IEP Caseload",
        icon: "ClipboardList",
        path: "/sped/iep-caseload",
      },
      {
        id: "renewals",
        label: "Renewals",
        icon: "RefreshCw",
        path: "/sped/renewals",
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: "ShieldCheck",
        path: "/sped/compliance",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/sped/messages",
      },
    ],
  },
  curriculumCoordinator: {
    defaultPath: "/curriculum/courses",
    primary: [
      {
        id: "courses",
        label: "Courses",
        icon: "BookOpen",
        path: "/curriculum/courses",
      },
      {
        id: "standards-map",
        label: "Standards Map",
        icon: "Map",
        path: "/curriculum/standards-map",
      },
      {
        id: "resource-library",
        label: "Resource Library",
        icon: "Library",
        path: "/curriculum/resource-library",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "BarChart2",
        path: "/curriculum/reports",
      },
    ],
  },
  substitute: {
    defaultPath: "/substitute/todays-classes",
    primary: [
      {
        id: "todays-classes",
        label: "Today's Classes",
        icon: "CalendarDays",
        path: "/substitute/todays-classes",
      },
      {
        id: "lesson-plans",
        label: "Lesson Plans",
        icon: "BookOpen",
        path: "/substitute/lesson-plans",
      },
      {
        id: "end-of-day",
        label: "End of Day",
        icon: "CheckCircle",
        path: "/substitute/end-of-day",
      },
      {
        id: "messages",
        label: "Messages",
        icon: "MessageSquare",
        path: "/substitute/admin-inbox",
      },
    ],
  },
};
