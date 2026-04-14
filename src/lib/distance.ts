/**
 * Haversine formula — returns distance in km between two lat/lng points
 */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Calculate delivery fare: base + per_km * distance */
export function deliveryFare(
  distanceKm: number,
  baseFare = 50,
  perKmRate = 12.5
): number {
  return Math.round(baseFare + distanceKm * perKmRate)
}

/** Rider earnings per delivery (platform keeps commission) */
export function riderEarnings(distanceKm: number): number {
  return Math.round(deliveryFare(distanceKm) * 0.8)
}
