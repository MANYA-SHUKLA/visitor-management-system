export type UserRole = 'guard' | 'resident' | 'admin';

export type VisitStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'entered'
  | 'exited';

export type HistoryPeriod = 'today' | 'week' | 'month' | '';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  apartment?: string;
  flatNumber?: string;
  phone?: string;
}

export interface Visit {
  _id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  status: VisitStatus;
  apartment: string;
  expectedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  entryAt?: string;
  exitAt?: string;
  createdAt: string;
  residentId?: User;
  registeredByGuardId?: User;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  read: boolean;
  visitId?: Visit;
  visitorId?: string;
  residentId?: string;
  createdAt: string;
}

export interface FrequentVisitor {
  visitorName: string;
  visitorPhone: string;
  visitCount: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  visitorsToday: number;
  approvedVisitors: number;
  rejectedVisitors: number;
  pending: number;
  onPremise: number;
  approvalRate: number;
  rejectionRate: number;
  statusCounts: Record<string, number>;
  avgDurationMinutes: number;
  visitsByDay: { date: string; count: number }[];
  visitsByWeek: { week: string; count: number }[];
  frequentVisitors: FrequentVisitor[];
  peakHours: { hour: number; count: number }[];
}
