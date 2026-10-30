/**
 * Free OpenStreetMap geocoding (Nominatim). No API key; the address text is sent
 * to nominatim.openstreetmap.org, so call it only from an explicit user click.
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org'

export interface GeoPoint {
  latitude: string
  longitude: string
}

export function getBrowserPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was denied. Allow it in the browser and try again.'
              : 'Could not get your current location.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 15_000 },
    )
  })
}

export async function geocodeAddress(query: string): Promise<GeoPoint> {
  const url = `${NOMINATIM}/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Address lookup failed. Try again.')
  const rows = (await res.json()) as { lat: string; lon: string }[]
  if (!rows.length) throw new Error('No location found for this address.')
  return {
    latitude: Number(rows[0].lat).toFixed(6),
    longitude: Number(rows[0].lon).toFixed(6),
  }
}

/** Short area/locality text for a coordinate, or '' when none is found. */
export async function reverseGeocodeArea(point: GeoPoint): Promise<string> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&zoom=16&lat=${point.latitude}&lon=${point.longitude}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return ''
  const data = (await res.json()) as { display_name?: string }
  return data.display_name ?? ''
}
