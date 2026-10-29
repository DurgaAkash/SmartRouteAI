import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  Building2,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { Bus as BusType, Route, User as UserType, PublicTransportService } from '../types';

interface BusRouteManagementPageProps {
  currentUser: UserType | null;
}

export const BusRouteManagementPage: React.FC<BusRouteManagementPageProps> = ({ currentUser }) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ptServices, setPtServices] = useState<PublicTransportService[]>([]);
  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'verified'>('buses');

  // Filters for verified public transport
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Bus State
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newRegNo, setNewRegNo] = useState('TN-20-CZ-4499');
  const [newModel, setNewModel] = useState('Tata Starbus Ultra 40-Seater');
  const [newCapacity, setNewCapacity] = useState(40);
  const [newDepot, setNewDepot] = useState('Avadi Regional Depot');
  const [newDriver, setNewDriver] = useState('K. Vijay');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 98401 99887');

  // New Route State
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('Vel Tech - Thiruvallur Link');
  const [newOrigin, setNewOrigin] = useState('Vel Tech Junction');
  const [newDestination, setNewDestination] = useState('Thiruvallur Collectorate');
  const [newDistance, setNewDistance] = useState(19.5);
  const [newDuration, setNewDuration] = useState(42);
  const [newFare, setNewFare] = useState(22);
  const [newType, setNewType] = useState('Rural Feeder');

  // New Verified Public Transport Service State
  const [showAddPtModal, setShowAddPtModal] = useState(false);
  const [ptOperator, setPtOperator] = useState('APSRTC');
  const [ptDivision, setPtDivision] = useState('APSRTC NTR District Division - Tiruvuru Depot');
  const [ptServiceNumber, setPtServiceNumber] = useState('4840 (Rural Feeder)');
  const [ptBusNumber, setPtBusNumber] = useState('AP-16-Z-5499');
  const [ptServiceType, setPtServiceType] = useState('Palle Velugu (Rural Feeder Ordinary)');
  const [ptOrigin, setPtOrigin] = useState('Khambhampadu');
  const [ptDestination, setPtDestination] = useState('Tiruvuru');
  const [ptDeparture, setPtDeparture] = useState('09:15');
  const [ptArrival, setPtArrival] = useState('10:05');
  const [ptFare, setPtFare] = useState(22);
  const [ptDistance, setPtDistance] = useState(25.4);
  const [ptDataSource, setPtDataSource] = useState('APSRTC Official Rural Feeder Network Timetable (NTR Dist Division)');
  const [ptVerificationStatus, setPtVerificationStatus] = useState<'VERIFIED_OFFICIAL' | 'SAMPLE_UNVERIFIED'>('VERIFIED_OFFICIAL');
  const [ptRemarks, setPtRemarks] = useState('Morning rural feeder ordinary service linking villages to Tiruvuru market');
  const [ptIntermediateStopsText, setPtIntermediateStopsText] = useState('Khambhampadu Village (10m), A.Konduru Mandal Junction (22m), Madhavaram Cross (38m), Tiruvuru APSRTC Bus Stand (50m)');

  const loadData = async () => {
    try {
      const [busData, routeData, ptData] = await Promise.all([
        api.getBuses(), 
        api.getRoutes(),
        api.getPublicTransportServices()
      ]);
      setBuses(busData);
      setRoutes(routeData);
      setPtServices(ptData);
    } catch (err) {
      console.error('Error fetching fleet and route data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBus({
        regNo: newRegNo,
        model: newModel,
        capacity: newCapacity,
        depot: newDepot,
        driverName: newDriver,
        driverPhone: newDriverPhone,
        assignedRouteId: routes[0]?.id || 'R-101',
      });
      setShowAddBusModal(false);
      await loadData();
    } catch (err: any) {
      alert('Error creating bus: ' + err.message);
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this vehicle?')) return;
    try {
      await api.deleteBus(id);
      await loadData();
    } catch (err: any) {
      alert('Error deleting bus: ' + err.message);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRoute({
        name: newRouteName,
        origin: newOrigin,
        destination: newDestination,
        distanceKm: newDistance,
        avgDurationMins: newDuration,
        fareInr: newFare,
        operatingType: newType,
        roadCondition: 'All-Weather Bitumen',
      });
      setShowAddRouteModal(false);
      await loadData();
    } catch (err: any) {
      alert('Error creating route: ' + err.message);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this rural corridor?')) return;
    try {
      await api.deleteRoute(id);
      await loadData();
    } catch (err: any) {
      alert('Error deleting route: ' + err.message);
    }
  };

  const handleAddPtService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse intermediate stops text
      const stopTokens = ptIntermediateStopsText.split(',').map(s => s.trim()).filter(Boolean);
      const intermediateStops = stopTokens.map((token, index) => {
        const timeMatch = token.match(/\((\d+)m\)/);
        const approxMins = timeMatch ? parseInt(timeMatch[1], 10) : (index + 1) * 15;
        const cleanName = token.replace(/\(\d+m\)/, '').trim();
        return {
          sequence: index + 1,
          stopName: cleanName,
          stopType: index === 0 ? 'Village Origin' : index === stopTokens.length - 1 ? 'Terminal Depot' : 'Mandal Hub',
          approxArrivalMins: approxMins,
          fareFromOriginInr: Math.round(ptFare * ((index + 1) / stopTokens.length))
        };
      });

      await api.createPublicTransportService({
        operatorName: ptOperator,
        operatorDivision: ptDivision,
        serviceNumber: ptServiceNumber,
        busNumber: ptBusNumber,
        serviceType: ptServiceType,
        originStop: ptOrigin,
        destinationStop: ptDestination,
        departureTime: ptDeparture,
        arrivalTime: ptArrival,
        fareInr: ptFare,
        totalDistanceKm: ptDistance,
        dataSource: ptDataSource,
        verificationStatus: ptVerificationStatus,
        remarks: ptRemarks,
        operatingDays: ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true,
        intermediateStops: intermediateStops.length > 0 ? intermediateStops : [
          { sequence: 1, stopName: ptOrigin, stopType: 'Origin', approxArrivalMins: 0, fareFromOriginInr: 0 },
          { sequence: 2, stopName: ptDestination, stopType: 'Terminal', approxArrivalMins: Math.round(ptDistance * 2), fareFromOriginInr: ptFare }
        ]
      });

      setShowAddPtModal(false);
      await loadData();
    } catch (err: any) {
      alert('Error creating public transport service: ' + err.message);
    }
  };

  const handleDeletePtService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this public transport service?')) return;
    try {
      await api.deletePublicTransportService(id);
      await loadData();
    } catch (err: any) {
      alert('Error deleting public transport service: ' + err.message);
    }
  };

  const handleTogglePtVerification = async (service: PublicTransportService) => {
    try {
      const newStatus = service.verificationStatus === 'VERIFIED_OFFICIAL' ? 'SAMPLE_UNVERIFIED' : 'VERIFIED_OFFICIAL';
      await api.updatePublicTransportService(service.id, {
        verificationStatus: newStatus,
        lastVerified: new Date().toISOString()
      });
      await loadData();
    } catch (err: any) {
      alert('Error updating verification status: ' + err.message);
    }
  };

  // Filtered public transport services
  const filteredPtServices = ptServices.filter(s => {
    if (operatorFilter !== 'all' && !s.operatorName.toLowerCase().includes(operatorFilter.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && s.verificationStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-1">
            <Bus className="w-4 h-4" />
            <span>Infrastructure &amp; Fleet Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bus &amp; Route Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain vehicle telematics, rural feeder lines, and official verified state road transport feeds (APSRTC, MTC, TNSTC).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'buses' && (
            <button
              onClick={() => setShowAddBusModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Bus Vehicle
            </button>
          )}
          {activeTab === 'routes' && (
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Rural Corridor
            </button>
          )}
          {activeTab === 'verified' && (
            <button
              onClick={() => setShowAddPtModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Verified Bus Service
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('buses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'buses'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" />
          Bus Fleet ({buses.length})
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'routes'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Local Feeder Corridors ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'verified'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verified State Feeds (APSRTC / RTCs) ({ptServices.length})
        </button>
      </div>

      {/* Fleet View */}
      {activeTab === 'buses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-mono text-emerald-400 font-bold text-xs">{bus.id}</span>
                  <h4 className="font-bold text-white text-sm">{bus.regNo}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {bus.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="font-medium text-white">{bus.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="font-mono text-emerald-400 font-bold">{bus.capacity} Seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Depot:</span>
                  <span>{bus.depot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Line:</span>
                  <span className="font-mono text-sky-300">{bus.assignedRouteId}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">{bus.driverName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{bus.driverPhone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBus(bus.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Routes View */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400 mr-2">{route.id}</span>
                  <span className="text-base font-bold text-white">{route.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    {route.operatingType}
                  </span>
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded"
                    title="Delete route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-800/60 p-3 rounded-xl font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">ORIGIN</span>
                  <span className="text-white font-semibold">{route.origin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DESTINATION</span>
                  <span className="text-white font-semibold">{route.destination}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ROAD METRICS</span>
                  <span className="text-emerald-400 font-bold">{route.distanceKm} km &bull; {route.avgDurationMins}m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BASE FARE</span>
                  <span className="text-amber-400 font-bold">₹ {route.fareInr}</span>
                </div>
              </div>

              {/* Stops sequence */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Configured Stops:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {route.stops?.map((stop, i) => (
                    <span
                      key={stop.stopId || i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {stop.stopName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verified State Road Transport Services View */}
      {activeTab === 'verified' && (
        <div className="space-y-6">
          {/* Informational Guidance Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm">Official Public Transit Datasets &amp; Verification Rules</h4>
              <p className="text-slate-300 leading-relaxed">
                Services registered here power the <strong>Dynamic Passenger Journey Search</strong> across India. When a passenger enters a corridor (such as <strong>Khambhampadu ➔ Tiruvuru</strong> in Andhra Pradesh), SmartRoute AI searches these verified records by stop sequence and travel direction. Demonstrations with unverified data are marked <em>"Sample Data — Not Verified"</em>.
              </p>
            </div>
          </div>

          {/* Filters & Count Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter Operator:
              </span>
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All State Operators</option>
                <option value="APSRTC">APSRTC (Andhra Pradesh)</option>
                <option value="MTC">MTC Chennai</option>
                <option value="TNSTC">TNSTC Villupuram</option>
                <option value="Sample">Sample Demo Carriers</option>
              </select>

              <span className="text-slate-400 font-medium ml-2">Verification:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="VERIFIED_OFFICIAL">Verified Official Only</option>
                <option value="SAMPLE_UNVERIFIED">Sample / Unverified Only</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing <span className="font-bold text-white">{filteredPtServices.length}</span> of {ptServices.length} registered public transport services
            </div>
          </div>

          {/* Grid of Verified Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPtServices.map((service) => {
              const isVerified = service.verificationStatus === 'VERIFIED_OFFICIAL';
              return (
                <div
                  key={service.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl space-y-4 transition-all ${
                    isVerified
                      ? 'border-slate-800 hover:border-emerald-500/40'
                      : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  {/* Top Bar: Operator, Service Number, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-black text-xs uppercase font-mono ${
                        service.operatorName.includes('APSRTC')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : service.operatorName.includes('MTC')
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {service.operatorName}
                      </span>
                      <span className="font-bold text-white text-sm">{service.serviceNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({service.busNumber})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePtVerification(service)}
                        title="Click to toggle verification status"
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 transition-colors ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        {isVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        {isVerified ? 'Verified Official' : 'Sample — Not Verified'}
                      </button>
                      <button
                        onClick={() => handleDeletePtService(service.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-800/60 p-3 rounded-xl font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CORRIDOR</span>
                      <span className="text-white font-semibold">{service.originStop} ➔ {service.destinationStop}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">SCHEDULE</span>
                      <span className="text-emerald-400 font-bold">{service.departureTime} – {service.arrivalTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">FARE &amp; DISTANCE</span>
                      <span className="text-amber-400 font-bold">₹{service.fareInr} &bull; {service.totalDistanceKm} km</span>
                    </div>
                  </div>

                  {/* Division & Type */}
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="text-[11px] text-slate-400 font-sans">
                      <span className="font-semibold text-slate-300">Service Type:</span> {service.serviceType}
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans">
                      <span className="font-semibold text-slate-300">Depot/Division:</span> {service.operatorDivision}
                    </p>
                  </div>

                  {/* Stops Sequence */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                      Stops Sequence ({service.intermediateStops?.length || 0}):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {service.intermediateStops?.map((stop, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700/80 flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {stop.stopName} ({stop.approxArrivalMins}m)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Data Source & Verification Audit */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-1">
                    <span className="truncate max-w-sm" title={service.dataSource}>
                      Source: {service.dataSource}
                    </span>
                    <span className="font-mono text-slate-500">
                      Verified: {new Date(service.lastVerified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Register New Fleet Bus</h3>
            <form onSubmit={handleAddBus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  value={newRegNo}
                  onChange={(e) => setNewRegNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Vehicle Model *</label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value) || 40)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Depot</label>
                  <input
                    type="text"
                    value={newDepot}
                    onChange={(e) => setNewDepot(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Create Rural Road Corridor</h3>
            <form onSubmit={handleAddRoute} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Route Corridor Name *</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Origin *</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDistance}
                    onChange={(e) => setNewDistance(parseFloat(e.target.value) || 15)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Est. Mins</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    value={newFare}
                    onChange={(e) => setNewFare(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-500"
                >
                  Save Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Verified Public Transport Modal */}
      {showAddPtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Register Verified Public Transport Service
              </h3>
              <button
                onClick={() => setShowAddPtModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPtService} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">State Operator Name *</label>
                  <input
                    type="text"
                    required
                    value={ptOperator}
                    onChange={(e) => setPtOperator(e.target.value)}
                    placeholder="e.g. APSRTC or MTC Chennai"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service Number / Code *</label>
                  <input
                    type="text"
                    required
                    value={ptServiceNumber}
                    onChange={(e) => setPtServiceNumber(e.target.value)}
                    placeholder="e.g. 4840 (Rural Feeder)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bus Vehicle Number</label>
                  <input
                    type="text"
                    value={ptBusNumber}
                    onChange={(e) => setPtBusNumber(e.target.value)}
                    placeholder="e.g. AP-16-Z-5499"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service Type *</label>
                  <input
                    type="text"
                    required
                    value={ptServiceType}
                    onChange={(e) => setPtServiceType(e.target.value)}
                    placeholder="e.g. Palle Velugu (Rural Feeder Ordinary)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Depot / Regional Division</label>
                <input
                  type="text"
                  value={ptDivision}
                  onChange={(e) => setPtDivision(e.target.value)}
                  placeholder="e.g. APSRTC NTR District Division - Tiruvuru Depot"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Origin Stop *</label>
                  <input
                    type="text"
                    required
                    value={ptOrigin}
                    onChange={(e) => setPtOrigin(e.target.value)}
                    placeholder="e.g. Khambhampadu"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Destination Stop *</label>
                  <input
                    type="text"
                    required
                    value={ptDestination}
                    onChange={(e) => setPtDestination(e.target.value)}
                    placeholder="e.g. Tiruvuru"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Departure</label>
                  <input
                    type="time"
                    required
                    value={ptDeparture}
                    onChange={(e) => setPtDeparture(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Arrival</label>
                  <input
                    type="time"
                    required
                    value={ptArrival}
                    onChange={(e) => setPtArrival(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    value={ptFare}
                    onChange={(e) => setPtFare(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dist (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ptDistance}
                    onChange={(e) => setPtDistance(parseFloat(e.target.value) || 25)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Intermediate Stops (comma-separated with approx arrival minutes)
                </label>
                <textarea
                  rows={2}
                  value={ptIntermediateStopsText}
                  onChange={(e) => setPtIntermediateStopsText(e.target.value)}
                  placeholder="Khambhampadu Village (0m), A.Konduru Mandal Junction (18m), Madhavaram Cross (38m), Tiruvuru APSRTC Bus Stand (50m)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Verification Status *</label>
                  <select
                    value={ptVerificationStatus}
                    onChange={(e) => setPtVerificationStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="VERIFIED_OFFICIAL">Verified Official Schedule</option>
                    <option value="SAMPLE_UNVERIFIED">Sample Data — Not Verified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Data Source</label>
                  <input
                    type="text"
                    value={ptDataSource}
                    onChange={(e) => setPtDataSource(e.target.value)}
                    placeholder="e.g. APSRTC Official Timetable"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Public Remarks / Notes</label>
                <input
                  type="text"
                  value={ptRemarks}
                  onChange={(e) => setPtRemarks(e.target.value)}
                  placeholder="e.g. Morning peak hour feeder for schools & markets"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPtModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 shadow-lg shadow-amber-600/30"
                >
                  Save Public Transport Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
