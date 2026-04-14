import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem, Vendor, User, Address } from '@/types'

interface CartStore {
  vendor: Vendor | null
  items: CartItem[]
  deliveryAddress: Address | null
  paymentMethod: 'mpesa' | 'cash'
  note: string

  addItem: (item: MenuItem, vendor: Vendor) => void
  removeItem: (itemId: string) => void
  updateQty: (itemId: string, qty: number) => void
  clearCart: () => void
  setDeliveryAddress: (addr: Address) => void
  setPaymentMethod: (method: 'mpesa' | 'cash') => void
  setNote: (note: string) => void

  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      vendor: null,
      items: [],
      deliveryAddress: null,
      paymentMethod: 'mpesa',
      note: '',

      addItem: (item, vendor) => {
        const { items, vendor: currentVendor } = get()
        // Clear cart if switching vendors
        if (currentVendor && currentVendor.id !== vendor.id) {
          set({ items: [], vendor })
        }
        const existing = items.find(i => i.item.id === item.id)
        if (existing) {
          set({
            items: items.map(i =>
              i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            vendor,
          })
        } else {
          set({ items: [...items, { item, quantity: 1 }], vendor })
        }
      },

      removeItem: (itemId) =>
        set(s => ({ items: s.items.filter(i => i.item.id !== itemId) })),

      updateQty: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId)
          return
        }
        set(s => ({
          items: s.items.map(i => i.item.id === itemId ? { ...i, quantity: qty } : i),
        }))
      },

      clearCart: () => set({ items: [], vendor: null, note: '' }),

      setDeliveryAddress: (addr) => set({ deliveryAddress: addr }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setNote: (note) => set({ note }),

      subtotal: () => get().items.reduce((s, i) => s + i.item.price * i.quantity, 0),
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'shop-cart' }
  )
)

interface AppStore {
  user: User | null
  setUser: (user: User | null) => void
  isOnline: boolean
  setIsOnline: (v: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isOnline: true,
  setIsOnline: (v) => set({ isOnline: v }),
}))
