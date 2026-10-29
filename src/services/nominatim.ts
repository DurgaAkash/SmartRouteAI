import { GeocodedLocation, RouteGeometry } from '../types';

// Curated fallbacks for instant response and offline fallback in Indian rural belts
const LOCAL_INDIAN_PLACES: GeocodedLocation[] = [
  { name: 'Vel Tech Junction', displayName: 'Vel Tech Junction, Avadi-Vel Tech Road, Thiruvallur, Tamil Nadu', lat: 13.1834, lng: 80.1037 },
  { name: 'Avadi Bus Terminal', displayName: 'Avadi Bus Terminal, Avadi, Chennai Metropolitan Area, Tamil Nadu', lat: 13.1185, lng: 80.1018 },
  { name: 'Pattabiram Railway Station', displayName: 'Pattabiram Railway Station, Pattabiram, Thiruvallur, Tamil Nadu', lat: 13.1215, lng: 80.0621 },
  { name: 'Morai Rural Colony', displayName: 'Morai Rural Colony, Ambattur Taluk, Thiruvallur, Tamil Nadu', lat: 13.1972, lng: 80.1245 },
  { name: 'Kollumedu Panchayat', displayName: 'Kollumedu Panchayat, Poonamallee Taluk, Thiruvallur, Tamil Nadu', lat: 13.1612, lng: 80.0891 },
  { name: 'Thiruvallur Collectorate', displayName: 'Thiruvallur District Collectorate, Thiruvallur, Tamil Nadu', lat: 13.1438, lng: 79.9079 },
  { name: 'Poonamallee Bus Stand', displayName: 'Poonamallee Bus Stand, Poonamallee, Chennai, Tamil Nadu', lat: 13.0489, lng: 80.0844 },
  { name: 'Red Hills Junction', displayName: 'Red Hills Bus Stand, Red Hills, Thiruvallur, Tamil Nadu', lat: 13.1983, lng: 80.1984 },
  { name: 'Mandya Rural Bus Stand', displayName: 'Mandya KSRTC Bus Stand, Mandya, Karnataka', lat: 12.5222, lng: 76.8974 },
  { name: 'Maddur Bus Stand', displayName: 'Maddur Old Bus Stand, Mandya District, Karnataka', lat: 12.5843, lng: 77.0456 },
  { name: 'Khambhampadu', displayName: 'Khambhampadu Village, A.Konduru / Tiruvuru Mandal, NTR District, Andhra Pradesh', lat: 17.0784, lng: 80.6845 },
  { name: 'Tiruvuru', displayName: 'Tiruvuru APSRTC Bus Stand, Tiruvuru, NTR District, Andhra Pradesh', lat: 17.1132, lng: 80.6128 },
  { name: 'A.Konduru', displayName: 'A.Konduru Bus Junction, NTR District, Andhra Pradesh', lat: 17.0261, lng: 80.6483 },
  { name: 'Madhavaram', displayName: 'Madhavaram Village, Tiruvuru Taluk, NTR District, Andhra Pradesh', lat: 17.1420, lng: 80.6380 },
  { name: 'Vijayawada Pandit Nehru Bus Station', displayName: 'PNBS Central Bus Station, Vijayawada, Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { name: 'Nuzvid Bus Stand', displayName: 'Nuzvid Bus Station, Eluru / Krishna, Andhra Pradesh', lat: 16.7865, lng: 80.8465 },
  { name: 'Baramati ST Stand', displayName: 'Baramati ST Depot, Baramati, Pune District, Maharashtra', lat: 18.1517, lng: 74.5772 },
  { name: 'Daund Rural Chowk', displayName: 'Daund Railway Chowk, Daund, Pune District, Maharashtra', lat: 18.4632, lng: 74.5821 },
];

export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  // Check local matches first
  const localMatches = LOCAL_INDIAN_PLACES.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.displayName.toLowerCase().includes(q.toLowerCase())
  );

  try {
    // Query OpenStreetMap Nominatim with India countrycode filter
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q
    )}&format=json&countrycodes=in&limit=6&addressdetails=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const nominatimResults: GeocodedLocation[] = data.map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));

        // Combine deduplicating by proximity
        const combined = [...localMatches, ...nominatimResults];
        const unique: GeocodedLocation[] = [];
        for (const loc of combined) {
          if (!unique.some((u) => Math.abs(u.lat - loc.lat) < 0.005 && Math.abs(u.lng - loc.lng) < 0.005)) {
            unique.push(loc);
          }
        }
        return unique.slice(0, 6);
      }
    }
  } catch (err) {
    console.warn('Nominatim network lookup failed or timed out, using local catalog:', err);
  }

  return localMatches;
}

export async function calculateRoadRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteGeometry> {
  // Query OSRM Public Routing Server
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [
          coord[1], // OSRM gives [lng, lat], Leaflet needs [lat, lng]
          coord[0],
        ]);
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const durationMins = Math.round(route.duration / 60);

        const steps: string[] = [];
        if (route.legs && route.legs[0]?.steps) {
          route.legs[0].steps.forEach((s: any) => {
            if (s.maneuver && s.name) {
              steps.push(`${s.maneuver.type} onto ${s.name || 'Road'} (${(s.distance / 1000).toFixed(1)} km)`);
            }
          });
        }

        return {
          coordinates,
          distanceKm,
          durationMins: Math.max(durationMins, Math.round(distanceKm * 2.2)), // Realistic Indian rural road speed
          steps: steps.length ? steps.slice(0, 5) : ['Depart along rural link road', 'Continue on main district highway', 'Arrive at destination stop'],
        };
      }
    }
  } catch (err) {
    console.warn('OSRM router service unavailable, generating geometric road path fallback:', err);
  }

  // Graceful deterministic geometric curved route fallback
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const directDist = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // ~111km per deg
  const distanceKm = parseFloat((directDist * 1.25).toFixed(1)); // road curvature factor
  const durationMins = Math.round(distanceKm * 2.5); // ~24 km/h rural bus speed

  const segments = 12;
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const fraction = i / segments;
    // Add sinusoidal lateral curvature to simulate real roads
    const arcOffset = Math.sin(fraction * Math.PI) * 0.008;
    const lat = start.lat + dLat * fraction + arcOffset;
    const lng = start.lng + dLng * fraction - arcOffset * 0.5;
    coords.push([lat, lng]);
  }

  return {
    coordinates: coords,
    distanceKm: Math.max(1.5, distanceKm),
    durationMins: Math.max(5, durationMins),
    steps: [
      'Depart origin stop via rural collector road',
      'Follow primary district connector',
      'Approach suburban transfer junction',
      'Arrive safely at destination station',
    ],
  };
}

export function getCurrentUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject(new Error(err.message || 'Unable to retrieve your location'));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
