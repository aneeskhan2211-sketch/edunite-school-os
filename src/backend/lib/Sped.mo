import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Common "../types/common";
import SpedTypes "../types/sped";
import Array "mo:core/Array";

module {

  // ── Constants ─────────────────────────────────────────────────────────
  let NANOS_PER_DAY : Int = 86_400_000_000_000;

  // ── Urgency computation ───────────────────────────────────────────────
  func computeUrgency(daysToRenewal : Int) : { #overdue; #danger; #warning; #info; #future } {
    if (daysToRenewal < 0)       { #overdue }
    else if (daysToRenewal <= 5) { #danger  }
    else if (daysToRenewal <= 14){ #warning }
    else if (daysToRenewal <= 30){ #info    }
    else                         { #future  }
  };

  func computeNextStep(daysToRenewal : Int) : Text {
    if (daysToRenewal < 0) {
      "Overdue — contact family today"
    } else if (daysToRenewal <= 5) {
      daysToRenewal.toText() # " days — schedule meeting now"
    } else if (daysToRenewal <= 14) {
      "2 weeks — send notification"
    } else if (daysToRenewal <= 30) {
      "4 weeks — begin preparation"
    } else {
      "No immediate action required"
    }
  };

  // ── getIEPCaseload ────────────────────────────────────────────────────
  public func getIEPCaseload(
    spedCoordId  : Common.StaffId,
    students     : Map.Map<Common.StudentId, Common.Student>,
    iepRecords   : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
  ) : [SpedTypes.IEPStudent] {
    let now = Time.now();
    let result = List.empty<SpedTypes.IEPStudent>();

    for ((_, student) in students.entries()) {
      // Only include SPED students assigned to this coordinator
      let isAssigned = switch (student.spedCoordinatorId) {
        case (?cid) cid == spedCoordId;
        case null   false;
      };
      if (isAssigned and student.specialPopFlags.sped) {
        // Find or synthesise renewal date
        let renewalDate : Common.Timestamp = switch (iepRecords.get(student.id)) {
          case (?rec) rec.renewalDate;
          // Default: 1 year from now if no IEP record exists yet
          case null   now + (365 * NANOS_PER_DAY);
        };
        let daysToRenewal : Int = (renewalDate - now) / NANOS_PER_DAY;
        let row : SpedTypes.IEPStudent = {
          studentId          = student.id;
          name               = student.name;
          grade              = student.grade;
          renewalDate        = renewalDate;
          daysToRenewal      = daysToRenewal;
          contextualNextStep = computeNextStep(daysToRenewal);
          urgencyTier        = computeUrgency(daysToRenewal);
          spedFlags          = student.specialPopFlags;
        };
        result.add(row);
      };
    };

    // Sort by urgency: overdue first, then by daysToRenewal ascending
    let arr = result.toArray();
    arr
  };

  // ── sortCaseload (pure sort by urgency then daysToRenewal) ────────────
  public func sortCaseload(rows : [SpedTypes.IEPStudent]) : [SpedTypes.IEPStudent] {
    func urgencyOrder(u : { #overdue; #danger; #warning; #info; #future }) : Int {
      switch u {
        case (#overdue) 0;
        case (#danger)  1;
        case (#warning) 2;
        case (#info)    3;
        case (#future)  4;
      }
    };
    rows.sort<SpedTypes.IEPStudent>(
      func(a, b) {
        let ua = urgencyOrder(a.urgencyTier);
        let ub = urgencyOrder(b.urgencyTier);
        if (ua < ub)      { #less    }
        else if (ua > ub) { #greater }
        else if (a.daysToRenewal < b.daysToRenewal) { #less    }
        else if (a.daysToRenewal > b.daysToRenewal) { #greater }
        else              { #equal   }
      }
    )
  };

  // ── getIEP ────────────────────────────────────────────────────────────
  public func getIEP(
    studentId  : Common.StudentId,
    iepRecords : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
    iepNotes   : Map.Map<SpedTypes.IEPNoteId, SpedTypes.IEPNote>,
  ) : ?SpedTypes.IEPDetail {
    switch (iepRecords.get(studentId)) {
      case null null;
      case (?rec) {
        let notes = List.empty<SpedTypes.IEPNote>();
        for ((_, note) in iepNotes.entries()) {
          if (note.studentId == studentId) notes.add(note);
        };
        ?{ record = rec; notes = notes.toArray() }
      };
    }
  };

  // ── updateIEPRenewalDate ───────────────────────────────────────────────
  public func updateIEPRenewalDate(
    studentId   : Common.StudentId,
    newDate     : Common.Timestamp,
    updatedBy   : Common.StaffId,
    iepRecords  : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
  ) : SpedTypes.UpdateResult {
    switch (iepRecords.get(studentId)) {
      case null {
        // Create a minimal IEP record if none exists
        let now = Time.now();
        iepRecords.add(studentId, {
          studentId      = studentId;
          renewalDate    = newDate;
          goals          = [];
          accommodations = [];
          services       = [];
          reviewHistory  = [];
          lastUpdatedAt  = now;
          lastUpdatedBy  = updatedBy;
          isDemoData     = false;
        });
        #ok
      };
      case (?existing) {
        iepRecords.add(studentId, {
          existing with
          renewalDate   = newDate;
          lastUpdatedAt = Time.now();
          lastUpdatedBy = updatedBy;
        });
        #ok
      };
    }
  };

  // ── addIEPNote ────────────────────────────────────────────────────────
  public func addIEPNote(
    studentId    : Common.StudentId,
    authorId     : Common.StaffId,
    body         : Text,
    noteType     : SpedTypes.IEPNoteType,
    iepNotes     : Map.Map<SpedTypes.IEPNoteId, SpedTypes.IEPNote>,
    state        : { var nextIEPNoteId : Nat },
  ) : SpedTypes.UpdateResult {
    let id = state.nextIEPNoteId;
    state.nextIEPNoteId += 1;
    iepNotes.add(id, {
      id;
      studentId;
      authorId;
      noteType;
      body;
      createdAt  = Time.now();
      isDemoData = false;
    });
    #ok
  };

  // ── markIEPRenewed ────────────────────────────────────────────────────
  public func markIEPRenewed(
    studentId   : Common.StudentId,
    renewedDate : Common.Timestamp,
    reviewedBy  : Common.StaffId,
    iepRecords  : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
  ) : SpedTypes.UpdateResult {
    switch (iepRecords.get(studentId)) {
      case null { #err "No IEP record found for student" };
      case (?existing) {
        let entry : SpedTypes.IEPReviewEntry = {
          reviewedAt = renewedDate;
          reviewedBy;
          notes      = "IEP renewed";
        };
        let updatedHistory = existing.reviewHistory.concat([entry]);
        let nextRenewal    = renewedDate + (365 * NANOS_PER_DAY);
        iepRecords.add(studentId, {
          existing with
          renewalDate   = nextRenewal;
          reviewHistory = updatedHistory;
          lastUpdatedAt = Time.now();
          lastUpdatedBy = reviewedBy;
        });
        #ok
      };
    }
  };

  // ── getComplianceItems ────────────────────────────────────────────────
  public func getComplianceItems(
    spedCoordId      : Common.StaffId,
    complianceItems  : Map.Map<SpedTypes.ComplianceItemId, SpedTypes.ComplianceItem>,
  ) : [SpedTypes.ComplianceItem] {
    let result = List.empty<SpedTypes.ComplianceItem>();
    for ((_, item) in complianceItems.entries()) {
      if (item.ownerId == spedCoordId) result.add(item);
    };
    result.toArray()
  };

  // ── updateComplianceItem ──────────────────────────────────────────────
  public func updateComplianceItem(
    itemId           : SpedTypes.ComplianceItemId,
    status           : SpedTypes.ComplianceStatus,
    notes            : ?Text,
    complianceItems  : Map.Map<SpedTypes.ComplianceItemId, SpedTypes.ComplianceItem>,
  ) : SpedTypes.UpdateResult {
    switch (complianceItems.get(itemId)) {
      case null { #err "Compliance item not found" };
      case (?existing) {
        let completedAt : ?Common.Timestamp = switch status {
          case (#complete) ?Time.now();
          case _           existing.completedAt;
        };
        complianceItems.add(itemId, {
          existing with
          status;
          notes;
          completedAt;
        });
        #ok
      };
    }
  };

  // ── getCaseloadInsight ────────────────────────────────────────────────
  public func getCaseloadInsight(
    spedCoordId : Common.StaffId,
    students    : Map.Map<Common.StudentId, Common.Student>,
    iepRecords  : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
    grades      : Map.Map<Common.GradeId, Common.Grade>,
    attendance  : Map.Map<Common.AttendanceId, Common.AttendanceRecord>,
    commitments : Map.Map<Common.CommitmentId, Common.Commitment>,
  ) : SpedTypes.CaseloadSummary {
    let now = Time.now();

    var totalStudents   = 0;
    var dueThisWeek     = 0;
    var overdueRenewals = 0;
    var gradeConcerns   = 0;
    var attendConcerns  = 0;

    let spedStudentIds = List.empty<Common.StudentId>();
    for ((_, student) in students.entries()) {
      let isAssigned = switch (student.spedCoordinatorId) {
        case (?cid) cid == spedCoordId;
        case null   false;
      };
      if (isAssigned and student.specialPopFlags.sped) {
        spedStudentIds.add(student.id);
        totalStudents += 1;
        switch (iepRecords.get(student.id)) {
          case (?rec) {
            let daysToRenewal = (rec.renewalDate - now) / NANOS_PER_DAY;
            if (daysToRenewal < 0)                         { overdueRenewals += 1 };
            if (daysToRenewal >= 0 and daysToRenewal <= 7) { dueThisWeek     += 1 };
          };
          case null {};
        };
      };
    };

    // Grade concerns: weighted avg < 65%
    let gradeSums = Map.empty<Common.StudentId, (Float, Float)>();
    for ((_, grade) in grades.entries()) {
      if (spedStudentIds.find(func(sid) { sid == grade.studentId }) != null) {
        switch (gradeSums.get(grade.studentId)) {
          case null {
            gradeSums.add(grade.studentId, (grade.value * grade.weight, grade.weight));
          };
          case (?(s, w)) {
            gradeSums.add(grade.studentId, (s + grade.value * grade.weight, w + grade.weight));
          };
        };
      };
    };
    for ((_, (s, w)) in gradeSums.entries()) {
      if (w > 0.0 and (s / w) < 65.0) gradeConcerns += 1;
    };

    // Attendance concerns: < 85% rate
    let attendDays = Map.empty<Common.StudentId, (Nat, Nat)>();
    for ((_, rec) in attendance.entries()) {
      if (spedStudentIds.find(func(sid) { sid == rec.studentId }) != null) {
        let (p, t) = switch (attendDays.get(rec.studentId)) {
          case null (0, 0);
          case (?v) v;
        };
        let presentAdd = switch (rec.status) { case (#present) 1; case _ 0 };
        attendDays.add(rec.studentId, (p + presentAdd, t + 1));
      };
    };
    for ((_, (p, t)) in attendDays.entries()) {
      if (t > 0 and (p * 100) / t < 85) attendConcerns += 1;
    };

    // Open commitments owned by this coordinator
    var openCommitments = 0;
    for ((_, c) in commitments.entries()) {
      let isOpen = switch (c.status) { case (#open) true; case _ false };
      if (c.ownerId == spedCoordId and isOpen) openCommitments += 1;
    };

    {
      totalStudents;
      dueThisWeek;
      overdueRenewals;
      studentsWithGradeConcerns      = gradeConcerns;
      studentsWithAttendanceConcerns = attendConcerns;
      openCommitments;
    }
  };

};
