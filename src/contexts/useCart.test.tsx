import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Product } from '../types/product'
import { CartProvider, useCart } from './CartContext'

const product = {
  id: 'producto-1',
  name: 'Camiseta Argentina',
  price: 100,
  stock: 5,
  active: true,
} as Product

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('inicia con el carrito vacío', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    expect(result.current.items).toEqual([])
    expect(result.current.totalItems).toBe(0)
    expect(result.current.totalPrice).toBe(0)
  })

  it('agrega productos y calcula el total', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.totalItems).toBe(2)
    expect(result.current.totalPrice).toBe(200)
  })

  it('actualiza la cantidad y recalcula el total', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    act(() => {
      result.current.addItem(product)
    })

    act(() => {
      result.current.updateQuantity('producto-1', 3)
    })

    expect(result.current.totalItems).toBe(3)
    expect(result.current.totalPrice).toBe(300)
  })

  it('elimina productos del carrito', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    act(() => {
      result.current.addItem(product)
    })

    act(() => {
      result.current.removeItem('producto-1')
    })

    expect(result.current.items).toEqual([])
  })

  it('vacía el carrito', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    act(() => {
      result.current.addItem(product)
    })

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.totalItems).toBe(0)
    expect(result.current.totalPrice).toBe(0)
  })

  it('guarda el carrito en localStorage', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper,
    })

    act(() => {
      result.current.addItem(product)
    })

    const saved = JSON.parse(
      localStorage.getItem('argentina-club-cart') ?? '[]'
    )

    expect(saved).toHaveLength(1)
    expect(saved[0].quantity).toBe(1)
  })
})

