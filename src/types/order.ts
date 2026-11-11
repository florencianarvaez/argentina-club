import type { Timestamp } from 'firebase/firestore'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Timestamp
}

