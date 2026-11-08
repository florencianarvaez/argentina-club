import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import { db } from './firebase'
import type { Product } from '../types/product'

// Obtener todos los productos activos
export async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products')

  const productsQuery = query(
    productsRef,
    where('active', '==', true)
  )

  const snapshot = await getDocs(productsQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Product[]
}

// Obtener un producto por su ID
export async function getProductById(
  id: string
): Promise<Product | null> {
  const productRef = doc(db, 'products', id)

  const snapshot = await getDoc(productRef)

  if (!snapshot.exists()) {
    return null
  }

  const product = {
    id: snapshot.id,
    ...snapshot.data(),
  } as Product

  // No mostrar productos desactivados
  if (!product.active) {
    return null
  }

  return product
}

