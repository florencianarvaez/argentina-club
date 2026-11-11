import type { VercelRequest, VercelResponse } from '@vercel/node'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface RequestedItem {
  productId: string
  quantity: number
}

function getFirebaseAdmin() {
  if (!getApps().length) {
    const serviceAccount =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT

    if (!serviceAccount) {
      throw new Error('Falta configurar Firebase Admin')
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    })
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.',
    })
  }

  try {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Debés iniciar sesión para comprar.',
      })
    }

    const { auth, db } = getFirebaseAdmin()

    const token = authorization.substring(7)
    const decodedToken = await auth.verifyIdToken(token)

    const items = req.body?.items as RequestedItem[] | undefined

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        error: 'El carrito no es válido.',
      })
    }

    const productIds = new Set<string>()

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== 'string' ||
        !item.productId.trim() ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 100 ||
        productIds.has(item.productId)
      ) {
        return res.status(400).json({
          error: 'Los productos o cantidades no son válidos.',
        })
      }

      productIds.add(item.productId)
    }

    const orderRef = db.collection('orders').doc()

    await db.runTransaction(async (transaction) => {
      const productRefs = items.map((item) =>
        db.collection('products').doc(item.productId)
      )

      const snapshots = await transaction.getAll(...productRefs)

      const orderItems = []
      let total = 0

      for (let index = 0; index < items.length; index++) {
        const requestedItem = items[index]
        const snapshot = snapshots[index]

        if (!snapshot.exists) {
          throw new Error('Uno de los productos ya no existe.')
        }

        const product = snapshot.data()

        if (!product || product.active !== true) {
          throw new Error('Uno de los productos no está disponible.')
        }

        if (
          !Number.isInteger(product.stock) ||
          product.stock < requestedItem.quantity
        ) {
          throw new Error(
            `No hay suficiente stock de "${product.name}".`
          )
        }

        if (
          typeof product.price !== 'number' ||
          !Number.isFinite(product.price) ||
          product.price < 0
        ) {
          throw new Error('Uno de los precios no es válido.')
        }

        const subtotal = product.price * requestedItem.quantity

        orderItems.push({
          productId: requestedItem.productId,
          name: product.name,
          price: product.price,
          quantity: requestedItem.quantity,
          subtotal,
        })

        total += subtotal
      }

      // Primero se completan todas las lecturas.
      // Después se actualiza el stock y se registra el pedido.
      for (let index = 0; index < items.length; index++) {
        const product = snapshots[index].data()!

        transaction.update(productRefs[index], {
          stock: product.stock - items[index].quantity,
        })
      }

      transaction.set(orderRef, {
        userId: decodedToken.uid,
        items: orderItems,
        total,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      })
    })

    return res.status(201).json({
      orderId: orderRef.id,
    })
  } catch (error) {
    console.error('Error al crear el pedido:', error)

    if (
      error instanceof Error &&
      (
        error.message.includes('stock') ||
        error.message.includes('no existe') ||
        error.message.includes('no está disponible') ||
        error.message.includes('no es válido')
      )
    ) {
      return res.status(400).json({
        error: error.message,
      })
    }

    return res.status(500).json({
      error: 'No pudimos confirmar tu pedido.',
    })
  }
}

