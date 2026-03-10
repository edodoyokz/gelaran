export type GateDisplayResultCode =
  | "SUCCESS"
  | "ALREADY_CHECKED_IN"
  | "INVALID"
  | "WRONG_EVENT"
  | "ACCESS_DENIED"
  | "SESSION_INACTIVE";

export type GateDisplayTone = "success" | "warning" | "danger";

export type GateResultDisplay = {
  title: string;
  description: string;
  tone: GateDisplayTone;
};

export function getGateResultDisplay(result: GateDisplayResultCode): GateResultDisplay {
  switch (result) {
    case "SUCCESS":
      return {
        title: "Check-in Berhasil!",
        description: "Tiket valid dan berhasil dicatat sebagai check-in.",
        tone: "success",
      };
    case "ALREADY_CHECKED_IN":
      return {
        title: "Sudah Check-in",
        description: "Tiket ini sudah pernah digunakan untuk check-in.",
        tone: "warning",
      };
    case "WRONG_EVENT":
      return {
        title: "Event Berbeda",
        description: "Tiket ini terdaftar untuk event lain dan tidak bisa dipakai di gate ini.",
        tone: "danger",
      };
    case "ACCESS_DENIED":
      return {
        title: "Akses Gate Ditolak",
        description: "Periksa akses device atau login ulang ke gate sebelum mencoba lagi.",
        tone: "danger",
      };
    case "SESSION_INACTIVE":
      return {
        title: "Sesi Gate Tidak Aktif",
        description: "Sesi gate scanner sudah tidak aktif. Aktifkan ulang akses gate terlebih dahulu.",
        tone: "danger",
      };
    case "INVALID":
    default:
      return {
        title: "Tiket Tidak Valid",
        description: "Kode tiket tidak ditemukan atau belum memenuhi syarat untuk check-in.",
        tone: "danger",
      };
  }
}
