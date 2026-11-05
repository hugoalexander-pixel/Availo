export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

export interface Booking {
  Id: string;
  FacilityName: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  Purpose: string;
  Status: BookingStatus;
  CreatedAt: string;
}

export interface BookingFormData {
  FacilityName: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  Purpose: string;
  Status?: BookingStatus;
}
