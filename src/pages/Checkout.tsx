import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../services/orderService'

export default function Checkout() {
  const { user, loading } = useAuth()
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-sky-900">Verificando sesión...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 px-6 text-center">
        <span className="text-6xl">🛒</span>

        <h1 className="mt-6 text-3xl font-bold text-sky-900">
          No hay productos para comprar
        </h1>

        <Link
          to="/productos"
          className="mt-6 rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white"
        >
          Ver productos
        </Link>
      </main>
    )
  }

  async function handleCheckout() {
    if (!user || submitting || items.length === 0) return

    setSubmitting(true)
    setError('')

    try {
      await createOrder(user.uid, items)

      clearCart()

      navigate('/mis-pedidos', {
        replace: true,
        state: { orderCreated: true },
      })
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos confirmar tu pedido. Intentá nuevamente.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/carrito"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Volver al carrito
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-sky-900">
          Finalizar compra 🇦🇷
        </h1>

        <p className="mt-3 text-gray-600">
          Revisá tu pedido antes de confirmarlo.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">

          <section className="rounded-2xl bg-white p-8 shadow-sm md:col-span-2">
            <h2 className="text-2xl font-bold text-sky-900">
              Tu pedido
            </h2>

            <div className="mt-6 space-y-5">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex justify-between gap-4 border-b border-sky-100 pb-4"
                >
                  <div>
                    <h3 className="font-semibold text-sky-900">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {quantity} × {product.price.toFixed(2)} €
                    </p>
                  </div>

                  <span className="font-semibold text-sky-900">
                    {(product.price * quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-sky-50 p-5">
              <h3 className="font-semibold text-sky-900">
                Compra simulada
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                No se realizará ningún cobro real.
                Tu pedido quedará registrado en Argentina Club.
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-sky-900">
              Resumen
            </h2>

            <div className="mt-6 flex justify-between text-gray-600">
              <span>Productos</span>
              <span>{totalItems}</span>
            </div>

            <hr className="my-6 border-sky-100" />

            <div className="flex justify-between text-xl font-bold text-sky-900">
              <span>Total estimado</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              El importe definitivo se calculará usando los precios
              actuales de Firestore.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-sky-700 px-6 py-4 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Confirmando pedido...'
                : 'Confirmar pedido'}
            </button>
          </aside>

        </div>
      </div>
    </main>
  )
}

