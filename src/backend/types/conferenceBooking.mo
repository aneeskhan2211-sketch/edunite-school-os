import Debug "mo:core/Debug";

module {

  public type ConferenceSlotId = Nat;
  public type ConferenceBookingId = Nat;
  public type Timestamp = Int;

  public type ConferenceSlot = {
    id             : ConferenceSlotId;
    teacherId      : Text;
    studentId      : Text;
    parentId       : Text;
    dateTime       : Int;
    durationMinutes: Nat;
    status         : { #available; #booked; #cancelled };
    bookedBy       : ?Text;
    notes          : ?Text;
    isDemoData     : Bool;
  };

  public type ConferenceBooking = {
    id               : ConferenceBookingId;
    slotId           : ConferenceSlotId;
    parentId         : Text;
    teacherId        : Text;
    studentId        : Text;
    bookedAt         : Int;
    status           : { #confirmed; #cancelled; #rescheduled };
    notificationSent : Bool;
    isDemoData       : Bool;
  };

};
