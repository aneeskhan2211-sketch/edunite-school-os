import Types "../types/common";
import STypes "../types/students";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Map "mo:core/Map";

module {

  // ── FERPA role helpers ────────────────────────────────────────────────

  /// True for roles with unrestricted read access to all student records.
  public func canReadAll(role : Types.Role) : Bool {
    switch role {
      case (#teacher or #schoolAdmin or #principal or #departmentHead
           or #districtAdmin or #curriculumCoordinator or #substitute
           or #coTeacher) { true };
      case _ { false };
    };
  };

  /// True for roles allowed to write student records.
  public func canWrite(role : Types.Role) : Bool {
    switch role {
      case (#teacher or #schoolAdmin or #principal or #counsellor
           or #spedCoordinator) { true };
      case _ { false };
    };
  };

  // ── Audit helpers ─────────────────────────────────────────────────────

  public func newAuditId(state : { var nextAuditId : Nat }) : Types.AuditId {
    let id = state.nextAuditId;
    state.nextAuditId += 1;
    id
  };

  public func makeAuditEntry(
    state     : { var nextAuditId : Nat },
    entityId  : Nat,
    action    : Text,
    actorId   : Types.StaffId,
    delta     : ?Text,
  ) : STypes.AuditEntry {
    {
      id         = newAuditId(state);
      entityType = "Student";
      entityId   = debug_show(entityId);
      action;
      actorId    = debug_show(actorId);
      actorRole  = #schoolAdmin;   // overridden by caller if needed
      timestamp  = Time.now();
      delta;
    };
  };

  public func makeAuditEntryWithRole(
    state     : { var nextAuditId : Nat },
    entityId  : Nat,
    action    : Text,
    actorId   : Types.StaffId,
    actorRole : Types.Role,
    delta     : ?Text,
  ) : STypes.AuditEntry {
    {
      id         = newAuditId(state);
      entityType = "Student";
      entityId   = debug_show(entityId);
      action;
      actorId    = debug_show(actorId);
      actorRole;
      timestamp  = Time.now();
      delta;
    };
  };

  // ── Type adapters ─────────────────────────────────────────────────────

  /// Map a Common.Student to the richer STypes.Student for full-record composition.
  public func toSTypesStudent(s : Types.Student) : STypes.Student {
    let sp : STypes.SpecialPopFlags = {
      isIEP          = s.specialPopFlags.sped;
      iepStartDate   = null;
      iepRenewalDate = null;
      isELL          = s.specialPopFlags.ell;
      widaLevel      = null;
      isMcKinneyVento = s.specialPopFlags.mcKinneyVento;
      isFosterYouth  = s.specialPopFlags.fosterYouth;
      isGifted       = s.specialPopFlags.gifted;
      medicalAlerts  = switch (s.specialPopFlags.medicalAlert) {
        case (?m) { [m] };
        case null { [] };
      };
    };
    {
      id                   = s.id;
      name                 = s.name;
      preferredName        = s.preferredName;
      dob                  = ?s.dob;
      grade                = s.grade;
      homeroom             = ?s.homeroom;
      photo                = s.photo;
      code                 = debug_show(s.id);
      enrolmentStatus      = switch (s.enrollmentStatus) {
        case (#active)      { #Active };
        case (#withdrawn)   { #Inactive };
        case (#graduated)   { #Transferred };
        case (#transferred) { #Transferred };
      };
      enrolmentDate        = 0;
      contacts             = [];
      assignedCounsellorId = switch (s.counsellorId) {
        case (?cid) { ?debug_show(cid) };
        case null { null };
      };
      assignedSpedId       = switch (s.spedCoordinatorId) {
        case (?sid) { ?debug_show(sid) };
        case null { null };
      };
      specialPop           = sp;
      demographics         = { race = null; ethnicity = null; frl = false; districtCode = null };
      isDemoData           = s.isDemoData;
    };
  };

  /// Validate, assign an id, persist, and return the new student record.
  public func createStudent(
    students  : Map.Map<Types.StudentId, Types.Student>,
    state     : { var nextStudentId : Nat; var nextAuditId : Nat },
    audits    : Map.Map<Types.AuditId, STypes.AuditEntry>,
    input     : Types.Student,
    ctx       : Types.RoleContext,
  ) : { #ok : Types.Student; #err : Text } {
    if (not canWrite(ctx.role)) {
      return #err "unauthorized";
    };
    if (input.name == "") { return #err "name is required" };
    if (input.homeroom == "") { return #err "homeroom is required" };
    let id = state.nextStudentId;
    state.nextStudentId += 1;
    let student : Types.Student = { input with id };
    students.add(id, student);
    let entry = makeAuditEntryWithRole(state, id, "create", ctx.userId, ctx.role, null);
    audits.add(entry.id, entry);
    #ok student
  };

  // ── Read ──────────────────────────────────────────────────────────────

  /// Retrieve one student with FERPA filtering.
  public func getStudent(
    students : Map.Map<Types.StudentId, Types.Student>,
    id       : Types.StudentId,
    ctx      : Types.RoleContext,
  ) : ?Types.Student {
    switch (students.get(id)) {
      case (null) { null };
      case (?s) {
        switch (ctx.role) {
          case (#student) { if (s.id == ctx.userId) { ?s } else { null } };
          case (#counsellor) {
            if (s.counsellorId == ?ctx.userId) { ?s } else { null }
          };
          case (#spedCoordinator) {
            if (s.spedCoordinatorId == ?ctx.userId) { ?s } else { null }
          };
          case _ { ?s };
        };
      };
    };
  };

  /// FERPA-filtered paginated list.
  public func listStudents(
    students  : Map.Map<Types.StudentId, Types.Student>,
    page      : Nat,
    pageSize  : Nat,
    ctx       : Types.RoleContext,
  ) : Types.PaginatedStudents {
    let all = students.entries();
    let filteredArr : [Types.Student] = switch (ctx.role) {
      case (#student) {
        all.map(
          func((_, s)) { s }
        ).filter(func(s) { s.id == ctx.userId }).toArray()
      };
      case (#counsellor) {
        all.map(
          func((_, s)) { s }
        ).filter(func(s) { s.counsellorId == ?ctx.userId }).toArray()
      };
      case (#spedCoordinator) {
        all.map(
          func((_, s)) { s }
        ).filter(func(s) { s.spedCoordinatorId == ?ctx.userId }).toArray()
      };
      case _ {
        all.map(
          func((_, s)) { s }
        ).toArray()
      };
    };
    let total = filteredArr.size();
    let start = page * pageSize;
    if (start >= total) {
      return { students = []; total };
    };
    let end = if (start + pageSize > total) { total } else { start + pageSize };
    let sliced = Array.tabulate(end - start, func(i) { filteredArr[start + i] });
    { students = sliced; total };
  };

  // ── Update ────────────────────────────────────────────────────────────

  /// Replace mutable fields on an existing student; write audit entry.
  public func updateStudent(
    students : Map.Map<Types.StudentId, Types.Student>,
    state    : { var nextStudentId : Nat; var nextAuditId : Nat },
    audits   : Map.Map<Types.AuditId, STypes.AuditEntry>,
    id       : Types.StudentId,
    input    : Types.Student,
    ctx      : Types.RoleContext,
  ) : { #ok : Types.Student; #err : Text } {
    if (not canWrite(ctx.role)) { return #err "unauthorized" };
    switch (students.get(id)) {
      case (null) { #err "not found" };
      case (?_existing) {
        let updated : Types.Student = { input with id };
        students.add(id, updated);
        let entry = makeAuditEntryWithRole(
          state, id, "update", ctx.userId, ctx.role,
          ?("name=" # updated.name),
        );
        audits.add(entry.id, entry);
        #ok updated
      };
    };
  };

  // ── Delete ────────────────────────────────────────────────────────────

  /// Soft-delete: set enrollmentStatus to #withdrawn. Only SchoolAdmin may call.
  public func deleteStudent(
    students : Map.Map<Types.StudentId, Types.Student>,
    state    : { var nextStudentId : Nat; var nextAuditId : Nat },
    audits   : Map.Map<Types.AuditId, STypes.AuditEntry>,
    id       : Types.StudentId,
    ctx      : Types.RoleContext,
  ) : { #ok; #err : Text } {
    switch (ctx.role) {
      case (#schoolAdmin) {};
      case _ { return #err "unauthorized" };
    };
    switch (students.get(id)) {
      case (null) { #err "not found" };
      case (?s) {
        let withdrawn : Types.Student = { s with enrollmentStatus = #withdrawn };
        students.add(id, withdrawn);
        let entry = makeAuditEntryWithRole(
          state, id, "delete", ctx.userId, ctx.role, null,
        );
        audits.add(entry.id, entry);
        #ok
      };
    };
  };

  // ── Full record ───────────────────────────────────────────────────────

  /// Compute GPA as weighted average of grade values.
  public func computeGPA(
    grades    : Map.Map<Types.GradeId, Types.Grade>,
    studentId : Types.StudentId,
  ) : ?Float {
    var weightedSum : Float = 0.0;
    var totalWeight : Float = 0.0;
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        weightedSum += g.value * g.weight;
        totalWeight += g.weight;
      };
    };
    if (totalWeight == 0.0) { null } else { ?(weightedSum / totalWeight) };
  };

  /// Compute attendance rate (0.0–1.0) for a student.
  public func computeAttendanceRate(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    studentId  : Types.StudentId,
  ) : Float {
    var total : Nat = 0;
    var present : Nat = 0;
    for ((_, a) in attendance.entries()) {
      if (a.studentId == studentId) {
        total += 1;
        switch (a.status) {
          case (#present or #tardy) { present += 1 };
          case _ {};
        };
      };
    };
    if (total == 0) { 1.0 } else { Float.fromInt(present) / Float.fromInt(total) };
  };

  /// True if any open incident for the student in the last 90 days.
  public func computeBehaviourFlag(
    incidents : Map.Map<Types.IncidentId, Types.Incident>,
    studentId : Types.StudentId,
  ) : Bool {
    let cutoff = Time.now() - 90 * 24 * 60 * 60 * 1_000_000_000;
    for ((_, inc) in incidents.entries()) {
      if (inc.studentId == studentId and inc.createdAt >= cutoff) {
        switch (inc.status) {
          case (#closed) {};
          case _ { return true };
        };
      };
    };
    false
  };

  /// Compute per-course trajectory from grades.
  public func computeTrajectory(
    grades    : Map.Map<Types.GradeId, Types.Grade>,
    studentId : Types.StudentId,
  ) : [STypes.TrajectoryResult] {
    // Collect course ids that have grades for this student
    let courseSet = Map.empty<Types.CourseId, Bool>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        courseSet.add(g.courseId, true);
      };
    };
    // Build a trajectory per course
    let results = Map.empty<Types.CourseId, STypes.TrajectoryResult>();
    for ((cid, _) in courseSet.entries()) {
      // collect grades for this course sorted by time
      var buf : [Types.Grade] = [];
      for ((_, g) in grades.entries()) {
        if (g.studentId == studentId and g.courseId == cid) {
          buf := Array.tabulate<Types.Grade>(
            buf.size() + 1,
            func(i) { if (i < buf.size()) { buf[i] } else { g } },
          );
        };
      };

      // last 5 values
      let n = buf.size();
      let last5start = if (n > 5) { n - 5 } else { 0 };
      let last5 = Array.tabulate(n - last5start, func(i) { buf[last5start + i].value });
      // rolling 3 average
      let r3start = if (n > 3) { n - 3 } else { 0 };
      var r3sum : Float = 0.0;
      var r3cnt : Nat = 0;
      for (i in buf.keys()) {
        if (i >= r3start) { r3sum += buf[i].value; r3cnt += 1 };
      };
      let rolling3Avg = if (r3cnt == 0) { 0.0 } else { r3sum / Float.fromInt(r3cnt) };
      // direction
      let direction = if (n < 2) { #Flat } else {
        let delta = buf[n - 1].value - buf[n - 2].value;
        if (delta > 3.0) { #Up } else if (delta < -3.0) { #Down } else { #Flat };
      };
      let passStatus = if (rolling3Avg >= 70.0) { #Passing }
                       else if (rolling3Avg >= 60.0) { #AtRisk }
                       else { #Failing };
      results.add(cid, {
        studentId      = debug_show(studentId);
        courseId       = debug_show(cid);
        direction;
        rolling3Avg;
        priorTermDelta = null;
        passStatus;
        lastFiveScores = last5;
      });
    };
    results.entries().map<
      (Types.CourseId, STypes.TrajectoryResult),
      STypes.TrajectoryResult
    >(func((_, v)) { v }).toArray()
  };

  /// Collect open commitments for a student.
  public func getStudentCommitments(
    commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
    studentId   : Types.StudentId,
  ) : [Types.Commitment] {
    let result = Map.empty<Types.CommitmentId, Types.Commitment>();
    for ((cid, c) in commitments.entries()) {
      if (c.studentId == studentId) {
        switch (c.status) {
          case (#completed) {};
          case _ { result.add(cid, c) };
        };
      };
    };
    result.entries().map<
      (Types.CommitmentId, Types.Commitment),
      Types.Commitment
    >(func((_, v)) { v }).toArray()
  };

  /// Collect understanding signals for a student.
  public func getStudentSignals(
    signals   : Map.Map<Types.SignalId, Types.UnderstandingSignal>,
    studentId : Types.StudentId,
  ) : [Types.UnderstandingSignal] {
    let result = Map.empty<Types.SignalId, Types.UnderstandingSignal>();
    for ((sid, sig) in signals.entries()) {
      switch (sig.studentId) {
        case (?(stid)) {
          if (stid == studentId) { result.add(sid, sig) };
        };
        case null {};
      };
    };
    result.entries().map<
      (Types.SignalId, Types.UnderstandingSignal),
      Types.UnderstandingSignal
    >(func((_, v)) { v }).toArray()
  };

  /// Last 20 audit entries for a student, most recent first.
  public func getAuditTrail(
    audits    : Map.Map<Types.AuditId, STypes.AuditEntry>,
    entityId  : Nat,
    role      : Types.Role,
  ) : [STypes.AuditEntry] {
    // Only privileged roles see the audit trail
    switch (role) {
      case (#teacher or #schoolAdmin or #principal) {};
      case _ { return [] };
    };
    let all = audits.entries()
      .map(func((_, e)) { e })
      .filter(func(e) { e.entityId == debug_show(entityId) })
      .toArray();
    // sort descending by timestamp (simple insertion sort — audit trails are small)
    let sorted = all.sort(
      func(a, b) { Int.compare(b.timestamp, a.timestamp) },
    );
    let take = if (sorted.size() > 20) { 20 } else { sorted.size() };
    Array.tabulate<STypes.AuditEntry>(take, func(i) { sorted[i] })
  };

  /// Compose the full connected record for one student (authorised roles only).
  public func getStudentFullRecord(
    students    : Map.Map<Types.StudentId, Types.Student>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents   : Map.Map<Types.IncidentId, Types.Incident>,
    commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
    signals     : Map.Map<Types.SignalId, Types.UnderstandingSignal>,
    audits      : Map.Map<Types.AuditId, STypes.AuditEntry>,
    id          : Types.StudentId,
    ctx         : Types.RoleContext,
  ) : ?STypes.StudentFullRecord {
    switch (getStudent(students, id, ctx)) {
      case (null) { null };
      case (?s) {
        ?{
          student              = toSTypesStudent(s);
          currentGPA           = computeGPA(grades, id);
          attendanceRate       = computeAttendanceRate(attendance, id);
          behaviourPatternFlag = computeBehaviourFlag(incidents, id);
          trajectory           = computeTrajectory(grades, id);
          commitments          = getStudentCommitments(commitments, id);
          signals              = getStudentSignals(signals, id);
          auditTrail           = getAuditTrail(audits, id, ctx.role);
        };
      };
    };
  };

};
