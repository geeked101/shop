// MERGE NOTE: Replace the 🗺️ placeholder in customer/track/TrackContent.tsx
// and rider/deliveries/page.tsx with this component.
//
// SETUP:
//   1. Get a Google Maps API key from https://console.cloud.google.com
//   2. Enable "Maps JavaScript API" and "Distance Matrix API"
//   3. Add to .env.local:
//        NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
//   4. npm install @googlemaps/js-api-loader

'use client'
import { useEffect, useRef } from 'react'

interface LatLng { lat: number; lng: number }

interface DeliveryMapProps {
  /** Vendor / pickup location */
  pickup: LatLng
  /** Customer / dropoff location */
  dropoff: LatLng
  /** Rider's current position — updates in real time */
  riderPosition?: LatLng
  /** Height of the map div */
  height?: number
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
    initMap?: () => void
  }
}

export default function DeliveryMap({
  pickup,
  dropoff,
  riderPosition,
  height = 220,
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riderMarker = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const directionsRenderer = useRef<any>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey) {
      console.warn('[DeliveryMap] NEXT_PUBLIC_GOOGLE_MAPS_KEY not set — map disabled')
      return
    }
    if (typeof window === 'undefined') return

    async function initMap() {
      // Load SDK if not already loaded
      if (!window.google?.maps) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
          script.async = true
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      if (!mapRef.current) return

      const google = window.google

      // Init map centered between pickup and dropoff
      const center = {
        lat: (pickup.lat + dropoff.lat) / 2,
        lng: (pickup.lng + dropoff.lng) / 2,
      }

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d4e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212135' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f23' }] },
        ],
      })

      // Pickup marker (green dot)
      new google.maps.Marker({
        position: pickup,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        title: 'Pickup',
      })

      // Dropoff marker (home icon)
      new google.maps.Marker({
        position: dropoff,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#1a1a2e',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        title: 'Destination',
      })

      // Rider marker
      riderMarker.current = new google.maps.Marker({
        position: riderPosition ?? center,
        map: mapInstance.current,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#FF385C"/><text x="50%" y="55%" text-anchor="middle" font-size="18" dy=".3em">🏍</text></svg>')}`,
          scaledSize: new google.maps.Size(36, 36),
        },
        title: 'Rider',
      })

      // Draw route
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FF385C',
          strokeOpacity: 0.8,
          strokeWeight: 3,
        },
      })

      const service = new google.maps.DirectionsService()
      service.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: unknown, status: string) => {
          if (status === 'OK') directionsRenderer.current.setDirections(result)
        }
      )
    }

    initMap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate rider marker position updates
  useEffect(() => {
    if (!riderMarker.current || !riderPosition) return
    riderMarker.current.setPosition(riderPosition)
  }, [riderPosition])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  if (!apiKey) {
    // Fallback placeholder when key not set
    return (
      <div
        style={{ height }}
        className="bg-[#eef2e6] flex flex-col items-center justify-center gap-2"
      >
        <div className="text-4xl">🗺️</div>
        <div className="text-xs text-gray-400 text-center px-4">
          Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local to enable live map
        </div>
      </div>
    )
  }

  return <div ref={mapRef} style={{ height, width: '100%' }} />
}
