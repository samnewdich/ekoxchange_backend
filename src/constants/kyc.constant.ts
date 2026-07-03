export const KycStatus = {
  PENDING:     "pending",
  IN_PROGRESS: "in_progress",
  APPROVED:    "approved",
  REJECTED:    "rejected",
} as const;

export type KycStatus = typeof KycStatus[keyof typeof KycStatus];