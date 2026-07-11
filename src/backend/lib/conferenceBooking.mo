import Time "mo:core/Time";
import T "../types/conferenceBooking";
import Array "mo:core/Array";

module {

  public func createSlot(
    id : T.ConferenceSlotId,
    teacherId : Text,
    dateTime : Int,
    durationMinutes : Nat,
  ) : T.ConferenceSlot {
    {
      id;
      teacherId;
      studentId = "";
      parentId = "";
      dateTime;
      durationMinutes;
      status = #available;
      bookedBy = null;
      notes = null;
    }
  };

  public func bookSlot(
    slot : T.ConferenceSlot,
    bookingId : T.ConferenceBookingId,
    parentId : Text,
    studentId : Text,
  ) : (T.ConferenceSlot, T.ConferenceBooking) {
    let updatedSlot : T.ConferenceSlot = {
      slot with
      status = #booked;
      bookedBy = ?parentId;
      studentId;
      parentId;
    };
    let booking : T.ConferenceBooking = {
      id = bookingId;
      slotId = slot.id;
      parentId;
      teacherId = slot.teacherId;
      studentId;
      bookedAt = Time.now();
      status = #confirmed;
      notificationSent = false;
    };
    (updatedSlot, booking)
  };

  public func cancelBookingAndFreeSlot(
    booking : T.ConferenceBooking,
    slot : T.ConferenceSlot,
  ) : (T.ConferenceBooking, T.ConferenceSlot) {
    let updatedBooking : T.ConferenceBooking = { booking with status = #cancelled };
    let updatedSlot : T.ConferenceSlot = {
      slot with
      status = #available;
      bookedBy = null;
      studentId = "";
      parentId = "";
    };
    (updatedBooking, updatedSlot)
  };

  public func isSlotAvailable(slot : T.ConferenceSlot) : Bool {
    slot.status == #available
  };

  public func isBookingActive(booking : T.ConferenceBooking) : Bool {
    booking.status == #confirmed
  };

  public func filterAvailableSlotsByTeacher(slots : [T.ConferenceSlot], teacherId : Text) : [T.ConferenceSlot] {
    slots.filter(func(s : T.ConferenceSlot) : Bool {
      s.teacherId == teacherId and s.status == #available
    });
  };

  public func filterBookingsByParent(bookings : [T.ConferenceBooking], parentId : Text) : [T.ConferenceBooking] {
    bookings.filter(func(b : T.ConferenceBooking) : Bool {
      b.parentId == parentId
    });
  };

  public func filterBookingsByTeacher(bookings : [T.ConferenceBooking], teacherId : Text) : [T.ConferenceBooking] {
    bookings.filter(func(b : T.ConferenceBooking) : Bool {
      b.teacherId == teacherId
    });
  };

  public func filterBookingsByStudent(bookings : [T.ConferenceBooking], studentId : Text) : [T.ConferenceBooking] {
    bookings.filter(func(b : T.ConferenceBooking) : Bool {
      b.studentId == studentId
    });
  };

  public func filterSlotsByStatus(slots : [T.ConferenceSlot], status : { #available; #booked; #cancelled }) : [T.ConferenceSlot] {
    slots.filter(func(s : T.ConferenceSlot) : Bool {
      s.status == status
    });
  };

  public func findSlotById(slots : [T.ConferenceSlot], id : T.ConferenceSlotId) : ?T.ConferenceSlot {
    slots.find(func(s : T.ConferenceSlot) : Bool { s.id == id });
  };

  public func findBookingById(bookings : [T.ConferenceBooking], id : T.ConferenceBookingId) : ?T.ConferenceBooking {
    bookings.find(func(b : T.ConferenceBooking) : Bool { b.id == id });
  };

  public func sortSlotsByDateTime(slots : [T.ConferenceSlot]) : [T.ConferenceSlot] {
    Array.sort<T.ConferenceSlot>(slots, func(a, b) {
      if (a.dateTime < b.dateTime) { #less } else if (a.dateTime > b.dateTime) { #greater } else { #equal };
    });
  };

  public func sortBookingsByBookedAt(bookings : [T.ConferenceBooking]) : [T.ConferenceBooking] {
    Array.sort<T.ConferenceBooking>(bookings, func(a, b) {
      if (a.bookedAt < b.bookedAt) { #less } else if (a.bookedAt > b.bookedAt) { #greater } else { #equal };
    });
  };

  public func isBookingConfirmed(booking : T.ConferenceBooking) : Bool {
    booking.status == #confirmed
  };

  public func isBookingActive(booking : T.ConferenceBooking) : Bool {
    booking.status == #confirmed
  };

}
