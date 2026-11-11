import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore'

import { auth, db } from './firebase'

import type { CartItem } from '../contexts/CartContext'
import type { Order, OrderStatus } from '../types/order'

// CREAR UN PEDIDO DESDE EL SERVIDOR
export async function createOrder(
  userId: string,
  cartItems: CartItem[]
): Promise<string> {
  if (!userId) {
    throw new Error('Debés iniciar sesión para comprar.')
  }

  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío.')
  }

  const currentUser = auth.currentUser

  if (!currentUser || currentUser.uid !== userId) {
    throw new Error(
      'Tu sesión no es válida. Volvé a iniciar sesión.'
    )
  }

  const token = await currentUser.getIdToken()

  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    }),
  })

  const data: {
    orderId?: string
    error?: string
  } = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error ?? 'No pudimos confirmar tu pedido.'
    )
  }

  if (!data.orderId) {
    throw new Error(
      'El servidor no devolvió el número de pedido.'
    )
  }

  return data.orderId
}

// OBTENER LOS PEDIDOS DE UN CLIENTE
export async function getUserOrders(
  userId: string
): Promise<Order[]> {
  const ordersQuery = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(ordersQuery)

  return snapshot.docs
    .map(
      (document) =>
        ({
          id: document.id,
          ...document.data(),
        }) as Order
    )
    .sort(
      (a, b) =>
        (b.createdAt?.toMillis?.() ?? 0) -
        (a.createdAt?.toMillis?.() ?? 0)
    )
}

// OBTENER TODOS LOS PEDIDOS (ADMINISTRADOR)
export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(
    collection(db, 'orders')
  )

  return snapshot.docs
    .map(
      (document) =>
        ({
          id: document.id,
          ...document.data(),
        }) as Order
    )
    .sort(
      (a, b) =>
        (b.createdAt?.toMillis?.() ?? 0) -
        (a.createdAt?.toMillis?.() ?? 0)
    )
}

// CAMBIAR EL ESTADO DE UN PEDIDO
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId)

  await updateDoc(orderRef, { status })
}

