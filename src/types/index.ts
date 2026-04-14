export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'collecting'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled'

export type VendorStatus = 'pending' | 'active' | 'suspended'
export type RiderStatus = 'pending' | 'active' | 'suspended'
export type VendorCategory = 'restaurant' | 'pharmacy' | 'grocery' | 'shop'

export interface User {
  id: string
  phone: string
  name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string
  address: string
  lat: number
  lng: number
  is_default: boolean
}

export interface Zone {
  id: string
  name: string
  is_active: boolean
  base_fare: number
  per_km_rate: number
}

export interface Vendor {
  id: string
  user_id: string
  name: string
  description: string
  category: VendorCategory
  phone: string
  address: string
  lat: number
  lng: number
  zone_id: string
  zone?: Zone
  logo_url?: string
  status: VendorStatus
  rating: number
  rating_count: number
  min_order: number
  is_open: boolean
  opening_hours: Record<string, { open: string; close: string; closed: boolean }>
  commission_rate: number
  created_at: string
}

export interface MenuItem {
  id: string
  vendor_id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
  created_at: string
}

export interface CartItem {
  item: MenuItem
  quantity: number
}

export interface Rider {
  id: string
  user_id: string
  name: string
  phone: string
  plate: string
  zone_id: string
  status: RiderStatus
  is_online: boolean
  lat?: number
  lng?: number
  rating: number
  rating_count: number
  total_trips: number
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  vendor_id: string
  rider_id?: string
  vendor?: Vendor
  rider?: Rider
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  service_fee: number
  total: number
  delivery_address: string
  delivery_lat: number
  delivery_lng: number
  distance_km: number
  payment_method: 'mpesa' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  mpesa_checkout_id?: string
  note?: string
  rating?: number
  review?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  name: string
  price: number
  quantity: number
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export interface Payout {
  id: string
  recipient_id: string
  recipient_type: 'vendor' | 'rider'
  amount: number
  status: 'pending' | 'paid' | 'failed'
  mpesa_ref?: string
  created_at: string
}

// Fare calculation
export function calculateFare(distanceKm: number, zone?: Zone) {
  const base = zone?.base_fare ?? 50
  const perKm = zone?.per_km_rate ?? 12.5
  return Math.round(base + distanceKm * perKm)
}
