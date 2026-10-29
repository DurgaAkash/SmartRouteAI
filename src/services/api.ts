import { User, Bus, Route, Schedule, CheckIn, AgentPlan, PublicTransportService, PublicTransportSearchResult, SchedulePlanVersion } from '../types';


const TOKEN_KEY = 'smartroute_auth_token';
const USER_KEY = 'smartroute_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      errorMsg = `Server error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  register: async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await apiRequest<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  adminLogin: async (data: { email: string; password: string }) => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  logout: () => {
    authStorage.clearToken();
  },

  getMe: async () => {
    return apiRequest<{ user: User }>('/api/auth/me');
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    return apiRequest<{
      totalPassengers: number;
      totalCheckIns: number;
      recordedDemand: number;
      predictedDemand: number;
      activeBuses: number;
      totalBuses: number;
      totalRoutes: number;
      publishedSchedules: number;
      proposedSchedules: number;
      pendingPlans: number;
      recentCheckIns: CheckIn[];
      recentSchedules: Schedule[];
    }>('/api/dashboard/stats');
  },

  // Buses
  getBuses: async (params?: { routeId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<Bus[]>(`/api/buses${query ? `?${query}` : ''}`);
  },

  getBusById: async (id: string) => {
    return apiRequest<Bus>(`/api/buses/${id}`);
  },

  updateBusTelemetry: async (busId: string, data: { currentLat?: number; currentLng?: number; lastSpeedKmh?: number; isSimulatedGps?: boolean; gpsSource?: string }) => {
    return apiRequest<Bus>(`/api/buses/${busId}/telemetry`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleBusGpsMode: async (busId: string) => {
    return apiRequest<Bus>(`/api/buses/${busId}/toggle-gps-mode`, {
      method: 'POST',
    });
  },

  createBus: async (busData: Partial<Bus>) => {
    return apiRequest<Bus>('/api/buses', {
      method: 'POST',
      body: JSON.stringify(busData),
    });
  },

  updateBus: async (id: string, busData: Partial<Bus>) => {
    return apiRequest<Bus>(`/api/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(busData),
    });
  },

  deleteBus: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/api/buses/${id}`, {
      method: 'DELETE',
    });
  },

  // Routes
  getRoutes: async () => {
    return apiRequest<Route[]>('/api/routes');
  },

  createRoute: async (routeData: Partial<Route>) => {
    return apiRequest<Route>('/api/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  },

  updateRoute: async (id: string, routeData: Partial<Route>) => {
    return apiRequest<Route>(`/api/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routeData),
    });
  },

  deleteRoute: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/api/routes/${id}`, {
      method: 'DELETE',
    });
  },

  // Schedules
  getSchedules: async (params?: { status?: string; routeId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<Schedule[]>(`/api/schedules${query ? `?${query}` : ''}`);
  },

  createSchedule: async (scheduleData: Partial<Schedule>) => {
    return apiRequest<Schedule>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  publishSchedule: async (id: string) => {
    return apiRequest<Schedule>(`/api/schedules/${id}/publish`, {
      method: 'PUT',
    });
  },

  deleteSchedule: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  // Check-ins & Passenger Requests
  submitCheckIn: async (data: {
    origin: string;
    destination: string;
    boardingStop?: string;
    destinationStop?: string;
    routeId?: string;
    routeName?: string;
    travelDate: string;
    travelTime: string;
    passengerCount: number;
    selectedBusId?: string;
  }) => {
    return apiRequest<CheckIn>('/api/check-ins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCheckIns: async (params?: { status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<CheckIn[]>(`/api/check-ins${query ? `?${query}` : ''}`);
  },

  getPassengerRequests: async (params?: { status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<CheckIn[]>(`/api/passenger/requests${query ? `?${query}` : ''}`);
  },

  updateRequestStatus: async (
    id: string,
    data: {
      status: 'pending' | 'approved' | 'rejected';
      assignedBusId?: string;
      assignedBusRegNo?: string;
      assignedRouteId?: string;
      assignedRouteName?: string;
      assignedDepartureTime?: string;
      assignedScheduleId?: string;
      adminRemarks?: string;
    }
  ) => {
    return apiRequest<CheckIn>(`/api/passenger/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Analytics & ML
  getDemandAnalytics: async () => {
    return apiRequest<{
      hourlyCurve: { hour: string; passengers: number; isPeak?: boolean }[];
      corridorRankings: { corridor: string; demand: number; loadPct: number; status: string; ruralStops: number }[];
      underservedVillages: { name: string; population: number; nearestStopKm: number; dailyTrips: number; riskScore: string; recommendation: string }[];
      dayDemand: { [day: string]: number };
    }>('/api/demand-analytics');
  },

  predictDemand: async (data: { hour: number; dayOfWeek: string; isMarketDay: boolean; routeBaseVolume: number }) => {
    return apiRequest<{
      predictedPassengers: number;
      baselinePrediction: number;
      confidenceInterval: [number, number];
      isPeak: boolean;
      capacityAlert: boolean;
      requiredBusesRecommendation: number;
      featureContribution: Record<string, string>;
    }>('/api/predict-demand', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getModelEvaluation: async () => {
    return apiRequest<any>('/api/model-evaluation');
  },

  optimizeRoute: async (data: { origin: string; destination: string; intermediateVillages?: string[] }) => {
    return apiRequest<any>('/api/optimize-route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  optimizeSchedule: async (data: { routeId?: string; availableBuses?: number; passengerDemand?: number; turnaroundMins?: number }) => {
    return apiRequest<any>('/api/optimize-schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dynamic Full-Fleet Schedule Planner & Versioning
  generateOptimizedSchedule: async (params?: { availableBuses?: number; turnaroundMins?: number; targetDate?: string }) => {
    return apiRequest<SchedulePlanVersion>('/api/schedules/generate-optimized', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  },

  getSchedulePlans: async () => {
    return apiRequest<SchedulePlanVersion[]>('/api/schedule-plans');
  },

  actionSchedulePlan: async (data: { versionId: string; action: 'APPROVE' | 'MODIFY' | 'REJECT'; modifiedTrips?: any[]; notes?: string }) => {
    return apiRequest<SchedulePlanVersion>('/api/schedule-plans/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Scenario Testing (Test A vs Test B demand test suite)
  seedScenario: async (scenario: 'TEST_A' | 'TEST_B' | 'RESET') => {
    return apiRequest<{ success: boolean; message: string; scenario: string; checkInsCount: number }>('/api/test/seed-scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  },


  // Agentic AI Planner
  runAgentPlan: async (data: { requestText: string; villages: string[]; numBuses: number; timeWindow: string }) => {
    return apiRequest<AgentPlan>('/api/agent/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPlans: async () => {
    return apiRequest<AgentPlan[]>('/api/plans');
  },

  actionPlan: async (data: { planId: string; action: 'APPROVE' | 'MODIFY' | 'REJECT'; modifiedTrips?: any[]; notes?: string }) => {
    return apiRequest<AgentPlan>('/api/plans/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Datasets
  getDatasets: async () => {
    return apiRequest<any[]>('/api/datasets');
  },

  uploadDataset: async (data: { filename: string; csvData: string; type?: string }) => {
    return apiRequest<any>('/api/datasets/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dynamic Verified Public Transport Services
  searchPublicTransport: async (params: { origin: string; destination: string; date?: string; time?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<PublicTransportSearchResult>(`/api/public-transport/search?${query}`);
  },

  getPublicTransportServices: async () => {
    return apiRequest<PublicTransportService[]>('/api/public-transport/services');
  },

  createPublicTransportService: async (data: Partial<PublicTransportService>) => {
    return apiRequest<PublicTransportService>('/api/public-transport/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePublicTransportService: async (id: string, data: Partial<PublicTransportService>) => {
    return apiRequest<PublicTransportService>(`/api/public-transport/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePublicTransportService: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/public-transport/services/${id}`, {
      method: 'DELETE',
    });
  },

  // Reports
  getReportsSummary: async () => {
    return apiRequest<any>('/api/reports/summary');
  },
};
