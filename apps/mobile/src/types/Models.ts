export type Role = "MAHASISWA" | "PENGELOLA";

export interface User {
  Id: number;
  Name: string;
  Email: string;
  Role: Role;
}

export type FacilityType =
  | "RUANG_KELAS"
  | "RUANG_DISKUSI"
  | "LABORATORIUM"
  | "AULA"
  | "RUANG_RAPAT";

export type FacilityStatus = "TERSEDIA" | "AKAN_TERSEDIA" | "SEDANG_DIGUNAKAN";

export type ReservationStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EARLY_ENDED";

export interface Amenity {
  Id: number;
  Name: string;
  Icon?: string | null;
}

export interface Building {
  Id: number;
  Name: string;
  Code: string;
  Description?: string | null;
}

export interface Facility {
  Id: number;
  Name: string;
  Type: FacilityType;
  Capacity: number;
  Floor: number;
  Description?: string | null;
  ImageUrl?: string | null;
  Building: Building;
  Amenities: Amenity[];
  Status: FacilityStatus;
}

export interface Reservation {
  Id: number;
  FacilityId: number;
  FacilityName: string;
  BuildingName?: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  ActualEndTime?: string | null;
  PartySize: number;
  Purpose?: string | null;
  Status: ReservationStatus;
  LocalPhotoUri?: string | null;
  CreatedAt: string;
  User?: {
    Id: number;
    Name: string;
  };
}

export interface NotificationItem {
  Id: number;
  FacilityId: number;
  Message: string;
  Type: "FACILITY_AVAILABLE" | "RESERVATION_REMINDER" | "RESERVATION_CANCELLED";
  IsRead: boolean;
  CreatedAt: string;
}

