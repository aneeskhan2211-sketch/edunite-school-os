import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import T "../types/conferenceBooking";

mixin (
  conferenceSlots    : Map.Map<T.ConferenceSlotId,    T.ConferenceSlot>,
  conferenceBookings : Map.Map<T.ConferenceBookingId, T.ConferenceBooking>,
  state : {
    var nextConferenceSlotId    : Nat;
    var nextConferenceBookingId : Nat;
  },
) {

  public query func getAvailableSlots(teacherId : Text) : async [T.ConferenceSlot] {
    conferenceSlots.values().toArray().filter(
      func(s : T.ConferenceSlot) : Bool {
        s.teacherId == teacherId and s.status == #available
      },
    );
  };

  public func bookConference(
    slotId   : T.ConferenceSlotId,
    parentId : Text,
    studentId: Text,
  ) : async { #ok : T.ConferenceBooking; #err : Text } {
    switch (conferenceSlots.get(slotId)) {
      case null { #err("Conference slot not found") };
      case (?slot) {
        if (slot.status != #available) {
          return #err("Conference slot is not available");
        };
        // Mark slot as booked
        let updatedSlot : T.ConferenceSlot = {
          slot with
          status   = #booked;
          bookedBy = ?parentId;
        };
        conferenceSlots.add(slotId, updatedSlot);
        state.nextConferenceBookingId += 1;
        let booking : T.ConferenceBooking = {
          id               = state.nextConferenceBookingId;
          slotId;
          parentId;
          teacherId        = slot.teacherId;
          studentId;
          bookedAt         = Time.now();
          status           = #confirmed;
          notificationSent = false;
          isDemoData       = false;
        };
        conferenceBookings.add(state.nextConferenceBookingId, booking);
        #ok(booking);
      };
    };
  };

  public func cancelBooking(
    bookingId : T.ConferenceBookingId,
  ) : async { #ok; #err : Text } {
    switch (conferenceBookings.get(bookingId)) {
      case null { #err("Booking not found") };
      case (?booking) {
        let updatedBooking : T.ConferenceBooking = { booking with status = #cancelled };
        conferenceBookings.add(bookingId, updatedBooking);
        // Also free the slot
        switch (conferenceSlots.get(booking.slotId)) {
          case (?slot) {
            let updatedSlot : T.ConferenceSlot = {
              slot with
              status   = #available;
              bookedBy = null;
            };
            conferenceSlots.add(booking.slotId, updatedSlot);
          };
          case null {};
        };
        #ok;
      };
    };
  };

  public query func getBookingsForParent(parentId : Text) : async [T.ConferenceBooking] {
    conferenceBookings.values().toArray().filter(
      func(b : T.ConferenceBooking) : Bool { b.parentId == parentId },
    );
  };

  public query func getBookingsForTeacher(teacherId : Text) : async [T.ConferenceBooking] {
    conferenceBookings.values().toArray().filter(
      func(b : T.ConferenceBooking) : Bool { b.teacherId == teacherId },
    );
  };

  public func generateSlotsFromTimetable(teacherId : Text) : async [T.ConferenceSlot] {
    // Returns existing available slots for this teacher.
    // Slot creation is handled by School Admin via the timetable module.
    let existing = conferenceSlots.values().toArray().filter(
      func(s : T.ConferenceSlot) : Bool {
        s.teacherId == teacherId and s.status == #available
      },
    );
    existing;
  };

};
