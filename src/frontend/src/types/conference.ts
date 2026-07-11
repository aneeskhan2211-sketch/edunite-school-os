export type ConferenceSlotId = bigint;
export type ConferenceBookingId = bigint;

export type ConferenceSlotStatus = "available" | "booked" | "cancelled";
export type ConferenceBookingStatus = "confirmed" | "cancelled" | "rescheduled";

export interface ConferenceSlot {
  id: ConferenceSlotId;
  teacherId: string;
  studentId: string;
  parentId: string;
  dateTime: bigint;
  durationMinutes: bigint;
  status: ConferenceSlotStatus;
  bookedBy?: string;
  notes?: string;
  isDemoData?: boolean;
}

export interface ConferenceBooking {
  id: ConferenceBookingId;
  slotId: ConferenceSlotId;
  parentId: string;
  teacherId: string;
  studentId: string;
  bookedAt: bigint;
  status: ConferenceBookingStatus;
  notificationSent: boolean;
  isDemoData?: boolean;
}
