import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Checkout from './Checkout'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../services/orderService'

const mockNavigate = vi.fn()
const mockClearCart = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../contexts/CartContext', () => ({
  useCart: vi.fn(),
}))

vi.mock('../services/orderService', () => ({
  createOrder: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('react-router-dom')>()

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUser = {
  uid: 'usuario-test-123',
}

const mockItems = [
  {
    product: {
      id: 'producto-1',
      name: 'Dulce de leche',
      price: 5,
    },
    quantity: 2,
  },
]

function configureMocks() {
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    loading: false,
  } as ReturnType<typeof useAuth>)

  vi.mocked(useCart).mockReturnValue({
    items: mockItems,
    totalItems: 2,
    totalPrice: 10,
    clearCart: mockClearCart,
  } as unknown as ReturnType<typeof useCart>)
}

function renderCheckout() {
  return render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  )
}

describe('Integración del checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configureMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('muestra los productos y el total', () => {
    renderCheckout()

    expect(screen.getByText('Dulce de leche')).toBeTruthy()
    expect(screen.getByText('Total estimado')).toBeTruthy()

    expect(
      screen.getByRole('button', { name: 'Confirmar pedido' })
    ).toBeTruthy()
  })

  it('envía el pedido al confirmar la compra', async () => {
    vi.mocked(createOrder).mockResolvedValueOnce('pedido-test-123')

    renderCheckout()

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar pedido' })
    )

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(
        'usuario-test-123',
        mockItems
      )
    })
  })

  it('vacía el carrito y redirige después de una compra exitosa', async () => {
    vi.mocked(createOrder).mockResolvedValueOnce('pedido-test-123')

    renderCheckout()

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar pedido' })
    )

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalledTimes(1)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/mis-pedidos',
        {
          replace: true,
          state: { orderCreated: true },
        }
      )
    })
  })

  it('muestra un error y conserva el carrito si falla la compra', async () => {
    vi.mocked(createOrder).mockRejectedValueOnce(
      new Error('No hay suficiente stock.')
    )

    renderCheckout()

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar pedido' })
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveProperty(
      'textContent',
      'No hay suficiente stock.'
    )

    expect(mockClearCart).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('no permite confirmar una compra con el carrito vacío', () => {
    vi.mocked(useCart).mockReturnValue({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      clearCart: mockClearCart,
    } as unknown as ReturnType<typeof useCart>)

    renderCheckout()

    expect(
      screen.getByText('No hay productos para comprar')
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', { name: 'Confirmar pedido' })
    ).toBeNull()
  })
})

