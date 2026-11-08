import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import type {
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'

import { db } from './firebase'
import type { CartItem } from '../contexts/CartContext'
import type { Order } from '../types/order'

export async function createOrder(
  userId: string,
  cartItems: CartItem[]
): Promise<string> {
  if (!userId || cartItems.length === 0) {
    throw new Error('No se puede crear un pedido vacío.')
  }

  const orderRef = doc(collection(db, 'orders'))

  await runTransaction(db, async (transaction) => {
    const productSnapshots: DocumentSnapshot<DocumentData>[] = []

    // Primero leemos todos los productos.
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.product.id)
      const snapshot = await transaction.get(productRef)

      if (!snapshot.exists()) {
        throw new Error(
          `El producto ${item.product.name} ya no existe.`
        )
      }

      productSnapshots.push(snapshot)
    }

    let total = 0

    const items = cartItems.map((item, index) => {
      const data = productSnapshots[index]?.data()

      // Comprobamos que Firebase haya devuelto los datos.
      if (!data) {
        throw new Error(
          `No se pudieron obtener los datos del producto ${item.product.name}.`
        )
      }

      if (
        data.active !== true ||
        typeof data.stock !== 'number' ||
        data.stock < item.quantity ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        typeof data.price !== 'number' ||
        !Number.isFinite(data.price) ||
        data.price < 0
      ) {
        throw new Error(
          `El producto ${item.product.name} no está disponible en esa cantidad.`
        )
      }

      const subtotal =
        Math.round(data.price * item.quantity * 100) / 100

      total += subtotal

      return {
        productId: item.product.id,
        name: data.name as string,
        price: data.price as number,
        quantity: item.quantity,
        subtotal,
      }
    })

    total = Math.round(total * 100) / 100

    // Simulamos la compra sin descontar stock.
    transaction.set(orderRef, {
      userId,
      items,
      total,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  })

  return orderRef.id
}

export async function getUserOrders(
  userId: string
): Promise<Order[]> {
  const ordersQuery = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(ordersQuery)

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

