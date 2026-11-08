import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'

import type { Product } from '../types/product'

export interface CartItem {
  product: Product
  quantity: number
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(
  state: CartItem[],
  action: CartAction
): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (action.product.stock <= 0 || !action.product.active) {
        return state
      }

      const existingItem = state.find(
        (item) => item.product.id === action.product.id
      )

      if (existingItem) {
        return state.map((item) =>
          item.product.id === action.product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  item.product.stock
                ),
              }
            : item
        )
      }

      return [...state, { product: action.product, quantity: 1 }]
    }

    case 'REMOVE_ITEM':
      return state.filter(
        (item) => item.product.id !== action.productId
      )

    case 'UPDATE_QUANTITY':
      return state
        .map((item) =>
          item.product.id === action.productId
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  Math.min(action.quantity, item.product.stock)
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)

    case 'CLEAR_CART':
      return []

    default:
      return state
  }
}

function loadInitialCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem('argentina-club-cart')

    if (!savedCart) return []

    const parsed: unknown = JSON.parse(savedCart)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.product === 'object' &&
        item.product !== null &&
        typeof item.product.id === 'string' &&
        typeof item.product.price === 'number' &&
        typeof item.product.stock === 'number' &&
        item.product.stock > 0
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(
    cartReducer,
    [],
    loadInitialCart
  )

  useEffect(() => {
    localStorage.setItem(
      'argentina-club-cart',
      JSON.stringify(items)
    )
  }, [items])

  function addItem(product: Product) {
    dispatch({ type: 'ADD_ITEM', product })
  }

  function removeItem(productId: string) {
    dispatch({ type: 'REMOVE_ITEM', productId })
  }

  function updateQuantity(productId: string, quantity: number) {
    dispatch({
      type: 'UPDATE_QUANTITY',
      productId,
      quantity,
    })
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' })
  }

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalPrice = items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider')
  }

  return context
}
