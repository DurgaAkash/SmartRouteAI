export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'passenger' | 'admin';
}

export interface Bus {
  id: string;
  regNo: string;
  model: string;
  capacity: number;
  assignedRouteId: string;
  depot: string;
  status: 'Active' | 'Maintenance' | 'Standby';
  driverName: string;
  driverPhone: string;
  currentLat: number;
  currentLng: number;
  lastSpeedKmh: number;
  isSimulatedGps: boolean;
  gpsSource?: string;
  lastUpdated: string;
}

export interface RouteStop {
  stopId: string;
  stopName: string;
  lat: number;
  lng: number;
  sequence: number;
  isRural: boolean;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  avgDurationMins: number;
  operatingType: string;
  roadCondition: string;
  fareInr: number;
  stops: RouteStop[];
}

export interface Schedule {
  id: string;
  routeId: string;
  routeName: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  frequencyMins: number;
  operatingDays: string[];
  status: 'PUBLISHED' | 'PROPOSED' | 'SUSPENDED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  passengerId?: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'TRAVEL_INTENTION' | 'VERIFIED_BOARDING';
  assignedBusId?: string;
  assignedBusRegNo?: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
  assignedDepartureTime?: string;
  assignedScheduleId?: string;
  adminRemarks?: string;
  approvedAt?: string;
  approvedBy?: string;
  submittedAt: string;
}

export interface ExecutionStep {
  step: number;
  tool: string;
  input: any;
  output: any;
  reasoning: string;
  timestamp: string;
}

export interface AgentPlan {
  id: string;
  title: string;
  requestText: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  predictedDemand: number;
  totalFleetCapacity: number;
  targetVillages: string[];
  totalDistanceKm: number;
  allocatedBuses: string[];
  proposedTrips: {
    tripId: string;
    busId: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    allocatedSeats: number;
  }[];
  constraintCheck: {
    passed: boolean;
    capacityAdequate: boolean;
    driverHoursCompliant: boolean;
    warnings: string[];
  };
  executionSteps: ExecutionStep[];
  adminNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface GeocodedLocation {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng]
  distanceKm: number;
  durationMins: number;
  steps: string[];
}

// ------------------------------------------------------------------
// Verified Public Transport Services Schema & Types
// ------------------------------------------------------------------
export interface IntermediateStop {
  stopName: string;
  sequence: number;
  stopType?: string;
  approxArrivalMins?: number;
  fareFromOriginInr?: number;
}

export interface PublicTransportService {
  id: string;
  serviceId: string;
  operatorName: string; // e.g. "APSRTC", "MTC Chennai", "KSRTC", "TSRTC", "TNSTC"
  operatorDivision?: string; // e.g. "APSRTC NTR District Division - Tiruvuru Depot"
  busNumber: string;
  serviceNumber: string; // e.g. "APSRTC-PV-4811"
  serviceType: string; // e.g. "Palle Velugu (Rural Ordinary)", "Ultra Deluxe", "Express Feeder", "MTC Deluxe"
  originStop: string;
  destinationStop: string;
  intermediateStops: IntermediateStop[];
  departureTime: string; // "06:45"
  arrivalTime: string; // "07:35"
  operatingDays: string[]; // ["Monday", "Tuesday", ...] or ["All Days"]
  validFrom?: string;
  validUntil?: string;
  fareInr: number;
  totalDistanceKm: number;
  dataSource: string; // e.g. "APSRTC Official District Feeder Timetable (NTR Dist Division)"
  lastVerified: string; // ISO string
  verificationStatus: 'VERIFIED_OFFICIAL' | 'SAMPLE_UNVERIFIED';
  isActive: boolean;
  remarks?: string;
}

export interface DirectServiceMatch {
  service: PublicTransportService;
  boardingStop: string;
  destinationStop: string;
  departureTime: string;
  arrivalTime: string;
  fareInr: number;
  stopsCount: number;
}

export interface ConnectingPublicTransportService {
  connectionId: string;
  transferHub: string;
  firstLeg: {
    service: PublicTransportService;
    boardingStop: string;
    alightingStop: string;
    departureTime: string;
    arrivalTime: string;
    fareInr: number;
  };
  secondLeg: {
    service: PublicTransportService;
    boardingStop: string;
    alightingStop: string;
    departureTime: string;
    arrivalTime: string;
    fareInr: number;
  };
  layoverMins: number;
  totalDurationMins: number;
  totalFareInr: number;
}

export interface PublicTransportSearchResult {
  directServices: DirectServiceMatch[];
  connectingServices: ConnectingPublicTransportService[];
  searchMeta: {
    origin: string;
    destination: string;
    travelDate: string;
    dayOfWeek: string;
    totalFound: number;
    dataSourceCount: number;
    hasVerifiedData: boolean;
  };
}

// ------------------------------------------------------------------
// Dynamic Schedule Planning, Optimization & Versioning Types
// ------------------------------------------------------------------
export interface PlannedTrip {
  tripId: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  busId: string;
  busRegNo: string;
  busModel: string;
  departureTime: string;
  arrivalTime: string;
  allocatedCapacity: number;
  expectedPassengers: number;
  unmetDemandPax?: number;
  turnaroundBufferMins: number;
  status: string; // e.g. "Feasible - Zero Conflict"
  reason?: string;
}

export interface SchedulePlanDiff {
  previousVersionId?: string;
  previousVersionNumber?: number;
  addedTrips: PlannedTrip[];
  removedTrips: PlannedTrip[];
  modifiedTrips: {
    tripId: string;
    routeName: string;
    oldDetails: { departureTime: string; arrivalTime: string; busId: string; capacity: number; passengers: number };
    newDetails: { departureTime: string; arrivalTime: string; busId: string; capacity: number; passengers: number };
    reason: string;
  }[];
  unmetDemand: {
    corridor: string;
    routeId: string;
    recordedDemand: number;
    predictedDemand: number;
    allocatedCapacity: number;
    unmetPassengers: number;
    recommendation: string;
  }[];
  changeReasons: string[];
}

export interface SchedulePlanVersion {
  versionId: string;
  versionNumber: number;
  label: string;
  status: 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  generatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  adminNotes?: string;
  dataSnapshot: {
    totalCheckInsUsed: number;
    activeBusesCount: number;
    totalFleetCapacity: number;
    activeRoutesCount: number;
    corridorDemands: {
      routeId: string;
      routeName: string;
      origin: string;
      destination: string;
      recordedDemand: number;
      predictedDemand: number;
      recommendedTrips: number;
    }[];
    parameters: {
      operatingHours: string;
      turnaroundMins: number;
      maxTripsPerBus: number;
    };
  };
  trips: PlannedTrip[];
  diff?: SchedulePlanDiff;
  metrics: {
    totalTrips: number;
    servedDemand: number;
    unmetDemand: number;
    demandSatisfactionPct: number;
    fleetUtilizationPct: number;
    totalOperatingDistanceKm: number;
  };
  optimizationLog: string[];
}

