export const AWARENESS_DAY_STATUS = {
  DISCOVERED: 'DISCOVERED',
  CONFIRMED: 'CONFIRMED',
  SKIPPED: 'SKIPPED',
} as const

export const DRAFT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SENT: 'SENT',
} as const

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const

export const THEME_COLORS: Record<string, string> = {
  'Health & Wellbeing': '#4CAF50',
  'Environment & Sustainability': '#2E7D32',
  'Social Justice & Equality': '#FF9800',
  'Education & Literacy': '#2196F3',
  'Culture & Heritage': '#9C27B0',
  'Science & Technology': '#00BCD4',
  'Peace & Humanitarian': '#F44336',
  'Children & Youth': '#FFEB3B',
  'Animals & Wildlife': '#795548',
  'Food & Agriculture': '#8BC34A',
} as const

export type AwarenessDayStatus =
  (typeof AWARENESS_DAY_STATUS)[keyof typeof AWARENESS_DAY_STATUS]
export type DraftStatus = (typeof DRAFT_STATUS)[keyof typeof DRAFT_STATUS]
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
