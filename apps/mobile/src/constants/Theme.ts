export const Colors = {
  primary: "#4F46E5",
  primaryLight: "#818CF8",
  primaryDark: "#3730A3",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  border: "#E2E8F0",
  borderFocused: "#4F46E5",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",

  // Reservation Status
  upcoming: "#2563EB",
  upcomingLight: "#DBEAFE",
  active: "#059669",
  activeLight: "#D1FAE5",
  completed: "#64748B",
  completedLight: "#F1F5F9",
  cancelled: "#DC2626",
  cancelledLight: "#FEE2E2",
  earlyEnded: "#D97706",
  earlyEndedLight: "#FEF3C7",

  // Backward compatibility aliases
  pending: "#2563EB",
  pendingLight: "#DBEAFE",
  confirmed: "#16A34A",
  confirmedLight: "#DCFCE7",

  // Facility Status
  tersedia: "#16A34A",
  tersediaLight: "#DCFCE7",
  akanTersedia: "#D97706",
  akanTersediaLight: "#FEF3C7",
  sedangDigunakan: "#DC2626",
  sedangDigunakanLight: "#FEE2E2",

  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export function getReservationStatusStyle(status: string) {
  switch (status) {
    case "UPCOMING":
      return { bg: Colors.upcomingLight, text: Colors.upcoming, label: "Mendatang" };
    case "ACTIVE":
      return { bg: Colors.activeLight, text: Colors.active, label: "Sedang Berjalan" };
    case "COMPLETED":
      return { bg: Colors.completedLight, text: Colors.completed, label: "Selesai" };
    case "CANCELLED":
      return { bg: Colors.cancelledLight, text: Colors.cancelled, label: "Dibatalkan" };
    case "EARLY_ENDED":
      return { bg: Colors.earlyEndedLight, text: Colors.earlyEnded, label: "Selesai Lebih Awal" };
    default:
      return { bg: Colors.surfaceElevated, text: Colors.textSecondary, label: status };
  }
}

export function getFacilityStatusStyle(status: string) {
  switch (status) {
    case "TERSEDIA":
      return { bg: Colors.tersediaLight, text: Colors.tersedia, label: "Tersedia" };
    case "AKAN_TERSEDIA":
      return { bg: Colors.akanTersediaLight, text: Colors.akanTersedia, label: "Segera Tersedia (≤30m)" };
    case "SEDANG_DIGUNAKAN":
      return { bg: Colors.sedangDigunakanLight, text: Colors.sedangDigunakan, label: "Sedang Digunakan" };
    default:
      return { bg: Colors.surfaceElevated, text: Colors.textSecondary, label: status };
  }
}
