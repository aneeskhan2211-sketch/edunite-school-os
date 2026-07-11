import Map "mo:core/Map";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Types "types/common";
import StudentsMixin "mixins/students-api";
import StaffMixin "mixins/staff-api";
import CoursesMixin "mixins/courses-api";
import GradesMixin "mixins/grades-api";
import AttendanceMixin "mixins/attendance-api";
import BehaviourMixin "mixins/behaviour-api";
import CommitmentsMixin "mixins/commitments-api";
import UnderstandingMixin "mixins/understanding-api";
import MessagingMixin "mixins/messaging-api";
import ReportsMixin "mixins/reports-api";
import SeedMixin "mixins/seed-api";
import DevAuthMixin "mixins/devauth-api";
import STypes "types/students";
import RosterMixin "mixins/roster-api";
import NotificationsMixin "mixins/notifications-api";
import CounsellorMixin "mixins/counsellor-api";
import CounsellorTypes "types/counsellor";
import SpedTypes "types/sped";
import SpedMixin "mixins/sped-api";
import CBTypes "types/conferenceBooking";
import ExtraTypes "types/extracurriculars";
import SRTypes "types/staffRoom";
import ConferenceBookingMixin "mixins/conference-booking-api";
import ExtracurricularsMixin "mixins/extracurriculars-api";
import StaffRoomMixin "mixins/staffroom-api";
import GradebookMixin "mixins/gradebook-api";
import SchedulingMixin "mixins/scheduling-api";
import AuthMixin "mixins/auth-api";
import GradebookSeed "lib/GradebookSeed";
import StudentSeed "lib/StudentSeed";
import StaffSeed "lib/StaffSeed";
import CourseSeed "lib/CourseSeed";
import ScheduleSeed "lib/ScheduleSeed";
import AttendanceSeed "lib/AttendanceSeed";
import BehaviourSeed "lib/BehaviourSeed";
import CommitmentSeed "lib/CommitmentSeed";
import NotificationSeed "lib/NotificationSeed";
import MessagingSeed "lib/MessagingSeed";
import CounsellorSeed "lib/CounsellorSeed";
import SpedSeed "lib/SpedSeed";
import AnnouncementSeed "lib/AnnouncementSeed";

actor {

  // ── Stable state (initialised by migration chain) ────────────────────────
  let students    : Map.Map<Types.StudentId, Types.Student>;
  let staff       : Map.Map<Types.StaffId, Types.Staff>;
  let courses     : Map.Map<Types.CourseId, Types.Course>;
  let assignments : Map.Map<Types.AssignmentId, Types.Assignment>;
  let grades      : Map.Map<Types.GradeId, Types.Grade>;
  let attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>;
  let incidents   : Map.Map<Types.IncidentId, Types.Incident>;
  let commitments : Map.Map<Types.CommitmentId, Types.Commitment>;
  let messages      : Map.Map<Types.MessageId, Types.Message>;
  let threads       : Map.Map<Types.ThreadId, Types.Thread>;
  let signals        : Map.Map<Types.SignalId, Types.UnderstandingSignal>;
  let submissions   : Map.Map<Types.SubmissionId, Types.Submission>;
  let announcements : Map.Map<Types.AnnouncementId, Types.Announcement>;
  let readReceipts    : Map.Map<Text, Bool>;
  let iepRecords      : Map.Map<Types.StudentId, SpedTypes.IEPRecord>;
  let iepNotes        : Map.Map<SpedTypes.IEPNoteId, SpedTypes.IEPNote>;
  let complianceItems : Map.Map<SpedTypes.ComplianceItemId, SpedTypes.ComplianceItem>;
  let notifications : Map.Map<Types.NotificationId, Types.Notification>;
  let interventions : Map.Map<CounsellorTypes.InterventionId, CounsellorTypes.Intervention>;
  let appointments  : Map.Map<CounsellorTypes.AppointmentId, CounsellorTypes.Appointment>;
  let studentAudits  : Map.Map<Types.AuditId, STypes.AuditEntry>;
  let state : {
    var nextStudentId    : Nat;
    var nextStaffId      : Nat;
    var nextCourseId     : Nat;
    var nextAssignmentId : Nat;
    var nextGradeId      : Nat;
    var nextAttendanceId : Nat;
    var nextIncidentId   : Nat;
    var nextCommitmentId : Nat;
    var nextMessageId    : Nat;
    var nextThreadId     : Nat;
    var nextAuditId        : Nat;
    var nextSignalId       : Nat;
    var nextSubmissionId   : Nat;
    var nextAnnouncementId   : Nat;
    var nextIEPNoteId        : Nat;
    var nextComplianceItemId : Nat;
    var nextNotificationId : Nat;
    var nextInterventionId      : Nat;
    var nextAppointmentId       : Nat;
    var isDemoDataLoaded        : Bool;
    var nextConferenceSlotId    : Nat;
    var nextConferenceBookingId : Nat;
    var nextActivityId          : Nat;
    var nextServiceEntryId      : Nat;
    var nextFieldTripId         : Nat;
    var nextPermissionSlipId    : Nat;
    var eligibilityGpaMin       : Float;
    var eligibilityAttMin       : Float;
    var nextChannelId           : Nat;
    var nextChannelMsgId        : Nat;
      var nextBoardItemId         : Nat;
      var nextCategoryId          : Nat;
      var nextScoreId             : Nat;
      var nextAssignmentV2Id      : Nat;
      var nextMeetingId           : Nat;
  };
  let devState : { var currentRole : Types.Role };

  // Conference booking
  let conferenceSlots    : Map.Map<CBTypes.ConferenceSlotId,    CBTypes.ConferenceSlot>;
  let conferenceBookings : Map.Map<CBTypes.ConferenceBookingId, CBTypes.ConferenceBooking>;

  // Extracurriculars
  let activities      : Map.Map<ExtraTypes.ActivityId,       ExtraTypes.Activity>;
  let activityRosters : Map.Map<Text,                        ExtraTypes.ActivityRoster>;
  let serviceHours    : Map.Map<ExtraTypes.ServiceEntryId,   ExtraTypes.ServiceHoursEntry>;
  let fieldTrips      : Map.Map<ExtraTypes.FieldTripId,      ExtraTypes.FieldTrip>;
  let permissionSlips : Map.Map<ExtraTypes.PermissionSlipId, ExtraTypes.PermissionSlip>;

  // Staff room
  let channels    : Map.Map<SRTypes.ChannelId,    SRTypes.Channel>;
  let channelMsgs : Map.Map<SRTypes.ChannelMsgId, SRTypes.ChannelMessage>;
  let boardItems  : Map.Map<SRTypes.BoardItemId,  SRTypes.BoardItem>;

  // Gradebook V2 storage
  let gradeCategories : Map.Map<Types.CategoryId, { id : Types.CategoryId; classId : Types.CourseId; name : Text; weight : Nat }>;
  let assignmentsV2   : Map.Map<Types.AssignmentId, { id : Types.AssignmentId; classId : Types.CourseId; categoryId : Types.CategoryId; name : Text; pointsPossible : Nat; dueDate : ?Text }>;
  let scores          : Map.Map<Types.ScoreId,    { id : Types.ScoreId; assignmentId : Types.AssignmentId; studentId : Types.StudentId; pointsEarned : ?Nat }>;

  // Scheduling: enrollment (rosters) + weekly timetable
  let enrollments   : Map.Map<Text, Types.Enrollment>;
  let classMeetings : Map.Map<Types.MeetingId, Types.ClassMeeting>;

  // Auth: principal-based RBAC registry (Phase 3). Provided by the migration.
  let accounts : Map.Map<Text, Types.Account>;


  system func postupgrade() {
    StudentSeed.seed({ students = students });
    StaffSeed.seed({ staff = staff });
    CourseSeed.seed({ courses = courses });
    GradebookSeed.seedClasses1To3({
      gradeCategories = gradeCategories;
      assignmentsV2 = assignmentsV2;
      scores = scores;
      nextCategoryId = state.nextCategoryId;
      nextAssignmentV2Id = state.nextAssignmentV2Id;
      nextScoreId = state.nextScoreId;
    });
    AttendanceSeed.seed({
      attendance = attendance;
      nextAttendanceId = state.nextAttendanceId;
    });
    BehaviourSeed.seed({
      incidents = incidents;
      nextIncidentId = state.nextIncidentId;
    });
    CommitmentSeed.seed({
      commitments = commitments;
      nextCommitmentId = state.nextCommitmentId;
    });
    NotificationSeed.seed({
      notifications = notifications;
      nextNotificationId = state.nextNotificationId;
    });
    MessagingSeed.seed({
      threads = threads;
      messages = messages;
      nextThreadId = state.nextThreadId;
      nextMessageId = state.nextMessageId;
    });
    ScheduleSeed.seed({
      enrollments = enrollments;
      classMeetings = classMeetings;
      nextMeetingId = state.nextMeetingId;
    });
    CounsellorSeed.seed({
      interventions = interventions;
      appointments = appointments;
      nextInterventionId = state.nextInterventionId;
      nextAppointmentId = state.nextAppointmentId;
    });
    SpedSeed.seed({
      iepRecords = iepRecords;
      complianceItems = complianceItems;
      nextComplianceItemId = state.nextComplianceItemId;
    });
    AnnouncementSeed.seed({
      announcements = announcements;
      nextAnnouncementId = state.nextAnnouncementId;
    });
  };

  // ── Domain mixins ─────────────────────────────────────────────────
  include StudentsMixin(students, studentAudits, grades, attendance, incidents, commitments, signals, state);
  include StaffMixin(staff, state);
  include CoursesMixin(courses, assignments, state);
  include GradesMixin(grades, assignments, students, courses, submissions, attendance, incidents, state);
  include AttendanceMixin(attendance, state);
  include BehaviourMixin(incidents, commitments, staff, state);
  include CommitmentsMixin(commitments, state);
  include UnderstandingMixin(students, grades, attendance, incidents, commitments, courses, assignments, signals, state);
  include MessagingMixin(threads, messages, announcements, readReceipts, state);
  include NotificationsMixin(notifications, state);
  include SeedMixin(state);
  include AuthMixin(accounts);
  include DevAuthMixin(staff, devState);
  include MixinViews();

  include ReportsMixin(students, staff, courses, grades, assignments, attendance, incidents);
  include SpedMixin(
    students, iepRecords, iepNotes, complianceItems,
    grades, attendance, commitments, state,
  );
  include RosterMixin(
    students, staff, courses, assignments, grades,
    attendance, incidents, commitments,
  );
  include CounsellorMixin(
    students, grades, attendance, incidents, commitments,
    interventions, appointments, state,
  );
  include ConferenceBookingMixin(conferenceSlots, conferenceBookings, state);
  include ExtracurricularsMixin(
    activities, activityRosters, serviceHours, fieldTrips, permissionSlips, state,
  );
  include StaffRoomMixin(channels, channelMsgs, boardItems, state);
  include GradebookMixin(courses, gradeCategories, assignmentsV2, scores, students, attendance, state);
  include SchedulingMixin(enrollments, classMeetings, courses, state);
};
