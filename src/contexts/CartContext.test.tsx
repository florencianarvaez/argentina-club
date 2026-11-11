import { describe, it, expect } from 'vitest'
import { cartReducer, type CartItem } from './CartContext'
import type { Product } from '../types/product'

const product = {
  id: 'producto-1',
  name: 'Camiseta Argentina',
  price: 100,
  stock: 5,
  active: true,
} as Product

const initialCart: CartItem[] = [
  { product, quantity: 1 },
]

describe('cartReducer', () => {
  it('agrega un producto al carrito', () => {
    const result = cartReducer([], {
      type: 'ADD_ITEM',
      product,
    })

    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(1)
  })

  it('aumenta la cantidad si el producto ya existe', () => {
    const result = cartReducer(initialCart, {
      type: 'ADD_ITEM',
      product,
    })

    expect(result[0].quantity).toBe(2)
  })

  it('elimina un producto del carrito', () => {
    const result = cartReducer(initialCart, {
      type: 'REMOVE_ITEM',
      productId: 'producto-1',
    })

    expect(result).toHaveLength(0)
  })

  it('actualiza la cantidad de un producto', () => {
    const result = cartReducer(initialCart, {
      type: 'UPDATE_QUANTITY',
      productId: 'producto-1',
      quantity: 3,
    })

    expect(result[0].quantity).toBe(3)
  })

  it('no permite superar el stock disponible', () => {
    const result = cartReducer(initialCart, {
      type: 'UPDATE_QUANTITY',
      productId: 'producto-1',
      quantity: 10,
    })

    expect(result[0].quantity).toBe(5)
  })

  it('no agrega productos sin stock', () => {
    const result = cartReducer([], {
      type: 'ADD_ITEM',
      product: { ...product, stock: 0 },
    })

    expect(result).toHaveLength(0)
  })

  it('no agrega productos inactivos', () => {
    const result = cartReducer([], {
      type: 'ADD_ITEM',
      product: { ...product, active: false },
    })

    expect(result).toHaveLength(0)
  })

  it('elimina un producto si su cantidad llega a cero', () => {
    const result = cartReducer(initialCart, {
      type: 'UPDATE_QUANTITY',
      productId: 'producto-1',
      quantity: 0,
    })

    expect(result).toHaveLength(0)
  })

  it('vacía completamente el carrito', () => {
    const result = cartReducer(initialCart, {
      type: 'CLEAR_CART',
    })

    expect(result).toEqual([])
  })

  it('no supera el stock al agregar repetidamente', () => {
    let cart: CartItem[] = []

    for (let i = 0; i < 10; i++) {
      cart = cartReducer(cart, {
        type: 'ADD_ITEM',
        product,
      })
    }

    expect(cart[0].quantity).toBe(5)
  })
})

