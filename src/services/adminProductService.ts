import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from './firebase'
import type { Product } from '../types/product'

export type ProductFormData = Omit<Product, 'id'>

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'))

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Product[]
}

export async function createProduct(
  product: ProductFormData
): Promise<void> {
  const productRef = doc(collection(db, 'products'))

  await setDoc(productRef, product)
}

export async function updateProduct(
  productId: string,
  product: ProductFormData
): Promise<void> {
  const productRef = doc(db, 'products', productId)

  await updateDoc(productRef, { ...product })
}

export async function toggleProductActive(
  productId: string,
  active: boolean
): Promise<void> {
  const productRef = doc(db, 'products', productId)

  await updateDoc(productRef, { active })
}

