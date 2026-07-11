import Common "common";

module {

  public type StudentId    = Common.StudentId;
  public type CourseId     = Common.CourseId;
  public type AssignmentId = Common.AssignmentId;
  public type GradeId      = Common.GradeId;
  public type StaffId      = Common.StaffId;
  public type Timestamp    = Common.Timestamp;

  // ── Assignment (rich canonical record) ────────────────────────────────
  public type Assignment = {
    id          : AssignmentId;
    courseId    : CourseId;
    name        : Text;
    description : ?Text;
    dueDate     : Int;
    maxScore    : Float;
    weight      : Float;
    isHighStakes : Bool;
    standards   : [Text];
    createdBy   : Text;
    createdAt   : Int;
    isDemoData  : Bool;
  };

  // ── Grade (canonical record) ───────────────────────────────────────────
  public type GradeStatus = { #Submitted; #Graded; #Returned };

  public type Grade = {
    id           : GradeId;
    studentId    : StudentId;
    assignmentId : AssignmentId;
    courseId     : CourseId;
    score        : ?Float;
    earnedScore  : ?Float;
    status       : GradeStatus;
    enteredBy    : Text;
    enteredAt    : Int;
    modifiedAt   : ?Int;
    isDemoData   : Bool;
  };

  // ── Computed results ──────────────────────────────────────────────────
  public type WeightedAverageResult = {
    studentId  : StudentId;
    courseId   : CourseId;
    average    : Float;
    count      : Nat;
    trajectory : Common.TrajectoryResult;
  };

  public type OverloadFlag = {
    courseId           : Text;
    week               : Text;
    affectedStudentIds : [Text];
    assignmentIds      : [Text];
    reason             : Text;
  };

  // ── Report card data (used by PDF generator) ──────────────────────────
  public type ReportCardData = {
    student           : Common.Student;
    term              : Text;
    courseGrades      : [(Common.Course, Float)];
    gpa               : Float;
    attendanceSummary : Common.AttendancePattern;
  };

  // ── Query result types (new endpoints) ──────────────────────────────────

  public type StudentGradeView = {
    courseId     : Common.CourseId;
    courseName   : Text;
    term         : Text;
    score        : Float;
    weight       : Float;
    letterGrade  : Text;
    assignmentName : Text;
  };

  public type ClassGradebookEntry = {
    studentId    : Common.StudentId;
    studentName  : Text;
    grades       : [{ assignmentId : Common.AssignmentId; assignmentName : Text; score : ?Float; maxScore : Float; weight : Float }];
    average      : Float;
  };

  public type TranscriptCourse = {
    courseId   : Common.CourseId;
    courseName : Text;
    term       : Text;
    grade      : Float;
    letterGrade: Text;
    credits    : Float;
  };

  public type TranscriptTerm = {
    term        : Text;
    courses     : [TranscriptCourse];
    termGpa     : Float;
    termCredits : Float;
  };

  public type StudentTranscript = {
    studentId     : Common.StudentId;
    studentName   : Text;
    terms         : [TranscriptTerm];
    cumulativeGpa : Float;
    totalCredits  : Float;
  };

  public type ReportCardAttendance = {
    totalDays   : Nat;
    presentDays : Nat;
    absentDays  : Nat;
    excusedDays : Nat;
    tardyDays   : Nat;
    percentage  : Float;
  };

  public type ReportCardBehaviour = {
    incidentCount : Nat;
    openIncidents : Nat;
    lastIncident  : ?Common.Timestamp;
  };

  // ── Gradebook V2 types ────────────────────────────────────────────────
  public type CategoryId = Common.CategoryId;
  public type ScoreId    = Common.ScoreId;

  public type GradeCategory = {
    id     : CategoryId;
    classId : Common.CourseId;
    name   : Text;
    weight : Nat;
  };

  public type AssignmentV2 = {
    id           : Common.AssignmentId;
    classId      : Common.CourseId;
    categoryId   : CategoryId;
    name         : Text;
    pointsPossible : Nat;
    dueDate      : ?Text;
  };

  public type Score = {
    id           : ScoreId;
    assignmentId : Common.AssignmentId;
    studentId    : Common.StudentId;
    pointsEarned : ?Nat;
  };

  public type StudentGradebookClassSummary = {
    classId            : Common.CourseId;
    className          : Text;
    weightedPercentage : Float;
    letterGrade        : Text;
  };

  public type StudentWeightedResult = {
    studentId      : Common.StudentId;
    overallPercent : Float;
    letterGrade    : Text;
  };

  // One student record enriched with computed GPA (V2 gradebook) and
  // attendance rate (0.0–1.0), returned by getStudentRoster in a single call.
  public type StudentRosterRow = {
    student        : Common.Student;
    gpa            : ?Float;
    attendanceRate : Float;
  };

  public type ReportCardResult = {
    student           : Common.Student;
    term              : Text;
    courseGrades      : [(Common.Course, Float, Text)]; // (course, average, letterGrade)
    gpa               : Float;
    attendanceSummary : ReportCardAttendance;
    behaviourSummary  : ReportCardBehaviour;
  };

};
