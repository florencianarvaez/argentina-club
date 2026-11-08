import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'

import { db } from './firebase'
import type { Order, OrderStatus } from '../types/order'

export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, 'orders'))

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }) as Order)
    .sort(
      (a, b) =>
        (b.createdAt?.toMillis?.() ?? 0) -
        (a.createdAt?.toMillis?.() ?? 0)
    )
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId)

  await updateDoc(orderRef, { status })
}

