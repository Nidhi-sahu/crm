// Geo utilities for Visit-Form location restriction.

const EARTH_RADIUS_M = 6371000;

// Accuracy contribution is capped so a device reporting an absurd accuracy
// (e.g. an IP-based laptop fix of 50km) can't make the radius effectively
// unlimited. Mobile GPS (~10m) stays near the strict base radius; laptops on
// wifi/IP get a sensible margin without defeating the restriction.
const ACCURACY_MARGIN_CAP_M = 1500;

const toRad = (deg) => (deg * Math.PI) / 180;

const isFiniteNumber = (n) => typeof n === 'number' && Number.isFinite(n);

const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check whether a submitted position is within the allowed radius of ANY
 * configured location, using an accuracy-aware effective radius.
 *
 * @param {{lat:number,lng:number,accuracy?:number}} current  submitted position
 * @param {Array<{name:string,lat:number,lng:number}>} locations  allowed locations
 * @param {number} baseRadiusM  base allowed radius (default 100)
 * @returns {{ verified:boolean, distanceMeters:number|null, matched:string,
 *             effectiveRadiusM:number, nearest:string }}
 */
const checkWithinAllowed = (current, locations, baseRadiusM = 100) => {
  const valid = (locations || []).filter(
    (l) => l && isFiniteNumber(l.lat) && isFiniteNumber(l.lng),
  );
  if (valid.length === 0) {
    return {
      verified: false,
      distanceMeters: null,
      matched: '',
      nearest: '',
      effectiveRadiusM: baseRadiusM,
      noLocationsConfigured: true,
    };
  }

  const accuracy = isFiniteNumber(current.accuracy) && current.accuracy > 0 ? current.accuracy : 0;
  const effectiveRadiusM = baseRadiusM + Math.min(accuracy, ACCURACY_MARGIN_CAP_M);

  let nearest = null;
  let nearestDist = Infinity;
  for (const loc of valid) {
    const d = haversineMeters(current.lat, current.lng, loc.lat, loc.lng);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = loc;
    }
  }

  const verified = nearestDist <= effectiveRadiusM;
  return {
    verified,
    distanceMeters: Math.round(nearestDist),
    matched: verified ? nearest.name : '',
    nearest: nearest ? nearest.name : '',
    effectiveRadiusM: Math.round(effectiveRadiusM),
    noLocationsConfigured: false,
  };
};

module.exports = { haversineMeters, checkWithinAllowed, ACCURACY_MARGIN_CAP_M };
