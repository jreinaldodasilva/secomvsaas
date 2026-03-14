import { useApiQuery } from './useApi';

interface DashboardSummary {
  counts: {
    pressReleases: number;
    mediaContacts: number;
    clippings: number;
    events: number;
    appointments: number;
    citizens: number;
    socialMedia: number;
  };
  pendingAppointments: number;
  recentPressReleases: { title: string; status: string; createdAt: string }[];
  upcomingEvents: { title: string; startsAt: string; location?: string }[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardSummary;
}

export function useDashboard() {
  return useApiQuery<DashboardResponse>(['dashboard'], '/api/v1/dashboard/summary');
}
