import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Spinner } from "@/components/ui/Spinner";
import LandingPage from "@/pages/LandingPage";
import { ROLE_DEFAULT_PATHS, useRoleStore } from "@/store/roleStore";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import React, { Suspense } from "react";

// Root layout — shell lives here so router context is available for nav hooks
const rootRoute = createRootRoute({
  notFoundComponent: function NotFound() {
    const navigate = useNavigate();
    const role = useRoleStore.getState().currentRole;
    React.useEffect(() => {
      navigate({ to: ROLE_DEFAULT_PATHS[role] });
    }, [navigate, role]);
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  },
  component: function RootLayout() {
    const router = useRouterState();
    const pathname = router.location.pathname;
    const isLanding = pathname === "/";

    if (isLanding) {
      return (
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-background">
              <Spinner size="lg" />
            </div>
          }
        >
          <LandingPage />
        </Suspense>
      );
    }

    // Full-screen, chrome-free routes (design canvas — no sidebar/auth shell)
    if (pathname === "/styleguide") {
      return (
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-background">
              <Spinner size="lg" />
            </div>
          }
        >
          <div className="h-screen overflow-y-auto bg-background">
            <Outlet />
          </div>
        </Suspense>
      );
    }

    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — persistent, never unmounts, uses useRouterState inside */}
        <div className="hidden md:flex">
          <SidebarNav />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>

        {/* Mobile nav — persistent */}
        <MobileNav />
      </div>
    );
  },
});

// Landing page at root
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

// ── Lazy page factory ─────────────────────────────────────────────────

function makePage(importFn: () => Promise<{ default: React.ComponentType }>) {
  const Comp = React.lazy(importFn);
  return function LazyPage() {
    return (
      <RouteErrorBoundary>
        <Comp />
      </RouteErrorBoundary>
    );
  };
}

function makeRoute(
  parent: typeof rootRoute,
  path: string,
  importFn: () => Promise<{ default: React.ComponentType }>,
) {
  return createRoute({
    getParentRoute: () => parent,
    path,
    component: makePage(importFn),
  });
}

// ── Teacher routes ───────────────────────────────────────────────────

const teacherTodayRoute = makeRoute(
  rootRoute,
  "/teacher/today",
  () => import("@/pages/teacher/Today"),
);
const teacherGradebookRoute = makeRoute(
  rootRoute,
  "/teacher/gradebook",
  () => import("@/pages/teacher/Gradebook"),
);
const teacherAttendanceRoute = makeRoute(
  rootRoute,
  "/teacher/attendance",
  () => import("@/pages/teacher/Attendance"),
);
const teacherBehaviourRoute = makeRoute(
  rootRoute,
  "/teacher/behaviour",
  () => import("@/pages/teacher/Behaviour"),
);
const teacherClassesRoute = makeRoute(
  rootRoute,
  "/teacher/classes",
  () => import("@/pages/teacher/Classes"),
);
const teacherStudentsRoute = makeRoute(
  rootRoute,
  "/teacher/students",
  () => import("@/pages/teacher/Students"),
);
const teacherClassDetailRoute = makeRoute(
  rootRoute,
  "/teacher/classes/$classId",
  () => import("@/pages/teacher/ClassDetail"),
);
const teacherStudentProfileRoute = makeRoute(
  rootRoute,
  "/teacher/student/$studentId",
  () => import("@/pages/teacher/StudentProfile"),
);
const teacherAssignmentsRoute = makeRoute(
  rootRoute,
  "/teacher/assignments",
  () => import("@/pages/teacher/Assignments"),
);
const teacherReportsRoute = makeRoute(
  rootRoute,
  "/teacher/reports",
  () => import("@/pages/teacher/Reports"),
);
const teacherMessagesRoute = makeRoute(
  rootRoute,
  "/teacher/messages",
  () => import("@/pages/teacher/Messages"),
);

// ── Co-Teacher routes

const coTeacherTodayRoute = makeRoute(
  rootRoute,
  "/co-teacher/today",
  () => import("@/pages/co-teacher/Today"),
);
const coTeacherGradebookRoute = makeRoute(
  rootRoute,
  "/co-teacher/gradebook",
  () => import("@/pages/co-teacher/Gradebook"),
);
const coTeacherClassesRoute = makeRoute(
  rootRoute,
  "/co-teacher/classes",
  () => import("@/pages/co-teacher/Classes"),
);
const coTeacherHandoffRoute = makeRoute(
  rootRoute,
  "/co-teacher/handoff",
  () => import("@/pages/co-teacher/HandoffLog"),
);

// ── Student routes

const studentTodayRoute = makeRoute(
  rootRoute,
  "/student/today",
  () => import("@/pages/student/Today"),
);
const studentAssignmentsRoute = makeRoute(
  rootRoute,
  "/student/assignments",
  () => import("@/pages/student/Assignments"),
);
const studentGradesRoute = makeRoute(
  rootRoute,
  "/student/grades",
  () => import("@/pages/student/Grades"),
);
const studentScheduleRoute = makeRoute(
  rootRoute,
  "/student/schedule",
  () => import("@/pages/student/Schedule"),
);
const studentMessagesRoute = makeRoute(
  rootRoute,
  "/student/messages",
  () => import("@/pages/student/Messages"),
);

// ── Parent routes

const parentChildrenRoute = makeRoute(
  rootRoute,
  "/parent/children",
  () => import("@/pages/parent/Children"),
);
const parentGradesRoute = makeRoute(
  rootRoute,
  "/parent/grades",
  () => import("@/pages/parent/Grades"),
);
const parentAttendanceRoute = makeRoute(
  rootRoute,
  "/parent/attendance",
  () => import("@/pages/parent/Attendance"),
);
const parentMessagesRoute = makeRoute(
  rootRoute,
  "/parent/messages",
  () => import("@/pages/parent/Messages"),
);

// ── School Admin routes

const adminDashboardRoute = makeRoute(
  rootRoute,
  "/school-admin/dashboard",
  () => import("@/pages/school-admin/Dashboard"),
);
const adminEnrolmentRoute = makeRoute(
  rootRoute,
  "/school-admin/enrolment",
  () => import("@/pages/school-admin/Enrolment"),
);
const adminStaffRoute = makeRoute(
  rootRoute,
  "/school-admin/staff",
  () => import("@/pages/school-admin/Staff"),
);
const adminTimetablesRoute = makeRoute(
  rootRoute,
  "/school-admin/timetables",
  () => import("@/pages/school-admin/Timetables"),
);
const adminSettingsRoute = makeRoute(
  rootRoute,
  "/school-admin/settings",
  () => import("@/pages/school-admin/Settings"),
);
const adminDataPrivacyRoute = makeRoute(
  rootRoute,
  "/school-admin/data-privacy",
  () => import("@/pages/school-admin/DataPrivacy"),
);

// ── Department Head routes

const deptDashboardRoute = makeRoute(
  rootRoute,
  "/department-head/dashboard",
  () => import("@/pages/department-head/Dashboard"),
);
const deptDepartmentRoute = makeRoute(
  rootRoute,
  "/department-head/department",
  () => import("@/pages/department-head/Department"),
);
const deptTeachersRoute = makeRoute(
  rootRoute,
  "/department-head/teachers",
  () => import("@/pages/department-head/Teachers"),
);
const deptCurriculumRoute = makeRoute(
  rootRoute,
  "/department-head/curriculum-alignment",
  () => import("@/pages/department-head/CurriculumAlignment"),
);

// ── Principal routes

const principalMorningRoute = makeRoute(
  rootRoute,
  "/principal/morning-picture",
  () => import("@/pages/principal/MorningPicture"),
);
const principalNeedsRoute = makeRoute(
  rootRoute,
  "/principal/needs-attention",
  () => import("@/pages/principal/NeedsAttention"),
);
const principalBehaviourRoute = makeRoute(
  rootRoute,
  "/principal/behaviour",
  () => import("@/pages/principal/Behaviour"),
);
const principalStaffRoute = makeRoute(
  rootRoute,
  "/principal/staff",
  () => import("@/pages/principal/Staff"),
);

// ── District Admin routes

const districtDashboardRoute = makeRoute(
  rootRoute,
  "/district-admin/district-dashboard",
  () => import("@/pages/district-admin/DistrictDashboard"),
);
const districtSchoolsRoute = makeRoute(
  rootRoute,
  "/district-admin/schools",
  () => import("@/pages/district-admin/Schools"),
);
const districtPatternsRoute = makeRoute(
  rootRoute,
  "/district-admin/patterns",
  () => import("@/pages/district-admin/Patterns"),
);
const districtBenchmarksRoute = makeRoute(
  rootRoute,
  "/district-admin/benchmarks",
  () => import("@/pages/district-admin/Benchmarks"),
);

// ── Counsellor routes

const counsellorCaseloadRoute = makeRoute(
  rootRoute,
  "/counsellor/caseload",
  () => import("@/pages/counsellor/Caseload"),
);
const counsellorNeedsRoute = makeRoute(
  rootRoute,
  "/counsellor/needs-attention",
  () => import("@/pages/counsellor/NeedsAttention"),
);
const counsellorInterventionsRoute = makeRoute(
  rootRoute,
  "/counsellor/interventions",
  () => import("@/pages/counsellor/Interventions"),
);
const counsellorAppointmentsRoute = makeRoute(
  rootRoute,
  "/counsellor/appointments",
  () => import("@/pages/counsellor/Appointments"),
);

// ── SPED routes

const spedIEPRoute = makeRoute(
  rootRoute,
  "/sped/iep-caseload",
  () => import("@/pages/sped/IEPCaseload"),
);
const spedRenewalsRoute = makeRoute(
  rootRoute,
  "/sped/renewals",
  () => import("@/pages/sped/Renewals"),
);
const spedComplianceRoute = makeRoute(
  rootRoute,
  "/sped/compliance",
  () => import("@/pages/sped/Compliance"),
);
const spedInsightRoute = makeRoute(
  rootRoute,
  "/sped/caseload-insight",
  () => import("@/pages/sped/CaseloadInsight"),
);

// ── Curriculum routes

const curriculumCoursesRoute = makeRoute(
  rootRoute,
  "/curriculum/courses",
  () => import("@/pages/curriculum/Courses"),
);
const curriculumUnitsRoute = makeRoute(
  rootRoute,
  "/curriculum/units",
  () => import("@/pages/curriculum/Units"),
);
const curriculumLessonsRoute = makeRoute(
  rootRoute,
  "/curriculum/lessons",
  () => import("@/pages/curriculum/Lessons"),
);
const curriculumStandardsRoute = makeRoute(
  rootRoute,
  "/curriculum/standards-map",
  () => import("@/pages/curriculum/StandardsMap"),
);

// ── Substitute routes

const subTodayRoute = makeRoute(
  rootRoute,
  "/substitute/todays-classes",
  () => import("@/pages/substitute/TodaysClasses"),
);
const subLessonPlansRoute = makeRoute(
  rootRoute,
  "/substitute/lesson-plans",
  () => import("@/pages/substitute/LessonPlans"),
);
const _subEndOfDayRoute = makeRoute(
  rootRoute,
  "/substitute/end-of-day",
  () => import("@/pages/substitute/EndOfDay"),
);

const incidentDetailRoute = makeRoute(
  rootRoute,
  "/incidents/$incidentId",
  () => import("@/pages/IncidentDetailPage"),
);

const reportCardRoute = makeRoute(
  rootRoute,
  "/report-card/$studentId",
  () => import("@/pages/shared/ReportCardPage"),
);

const earlyWarningRoute = makeRoute(
  rootRoute,
  "/early-warning",
  () => import("@/pages/shared/EarlyWarning"),
);

const communityFeedRoute = makeRoute(
  rootRoute,
  "/community",
  () => import("@/pages/shared/CommunityFeed"),
);

const notificationsRoute = makeRoute(
  rootRoute,
  "/notifications",
  () => import("@/routes/notifications"),
);

const styleGuideRoute = makeRoute(
  rootRoute,
  "/styleguide",
  () => import("@/pages/StyleGuide"),
);

const routeTree = rootRoute.addChildren([
  landingRoute,
  styleGuideRoute,
  teacherTodayRoute,
  teacherGradebookRoute,
  teacherAttendanceRoute,
  teacherBehaviourRoute,
  teacherClassesRoute,
  teacherStudentsRoute,
  teacherClassDetailRoute,
  teacherStudentProfileRoute,
  teacherAssignmentsRoute,
  teacherReportsRoute,
  teacherMessagesRoute,
  coTeacherTodayRoute,
  coTeacherGradebookRoute,
  coTeacherClassesRoute,
  coTeacherHandoffRoute,
  studentTodayRoute,
  studentAssignmentsRoute,
  studentGradesRoute,
  studentScheduleRoute,
  studentMessagesRoute,
  parentChildrenRoute,
  parentGradesRoute,
  parentAttendanceRoute,
  parentMessagesRoute,
  adminDashboardRoute,
  adminEnrolmentRoute,
  adminStaffRoute,
  adminTimetablesRoute,
  adminSettingsRoute,
  adminDataPrivacyRoute,
  deptDashboardRoute,
  deptDepartmentRoute,
  deptTeachersRoute,
  deptCurriculumRoute,
  principalMorningRoute,
  principalNeedsRoute,
  principalBehaviourRoute,
  principalStaffRoute,
  districtDashboardRoute,
  districtSchoolsRoute,
  districtPatternsRoute,
  districtBenchmarksRoute,
  counsellorCaseloadRoute,
  counsellorNeedsRoute,
  counsellorInterventionsRoute,
  counsellorAppointmentsRoute,
  spedIEPRoute,
  spedRenewalsRoute,
  spedComplianceRoute,
  spedInsightRoute,
  curriculumCoursesRoute,
  curriculumUnitsRoute,
  curriculumLessonsRoute,
  curriculumStandardsRoute,
  subTodayRoute,
  subLessonPlansRoute,
  incidentDetailRoute,
  reportCardRoute,
  earlyWarningRoute,
  communityFeedRoute,
  notificationsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
