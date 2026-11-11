import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { getUserOrders } from '../services/orderService'

import type { Order, OrderStatus } from '../types/order'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En preparación',
  completed: 'Completado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function MyOrders() {
  const { user } = useAuth()
  const location = useLocation()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const orderCreated =
    (location.state as { orderCreated?: boolean } | null)
      ?.orderCreated === true

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await getUserOrders(user.uid)

        if (!cancelled) {
          setOrders(data)
          setError('')
        }
      } catch (err) {
        console.error(err)

        if (!cancelled) {
          setError('No pudimos cargar tus pedidos.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-sky-900">Cargando tus pedidos...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">

        <Link
          to="/"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-sky-900 sm:text-4xl">
          Mis pedidos 📦
        </h1>

        <p className="mt-3 text-gray-600">
          Consultá tus compras en Argentina Club.
        </p>

        {orderCreated && (
          <div
            role="status"
            className="mt-8 rounded-xl bg-green-50 p-5 font-semibold text-green-800"
          >
            🎉 ¡Tu pedido fue registrado correctamente!
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-5 text-red-700"
          >
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm sm:p-10">
            <span className="text-6xl">📦</span>

            <h2 className="mt-5 text-2xl font-bold text-sky-900">
              Todavía no tenés pedidos
            </h2>

            <p className="mt-3 text-gray-600">
              ¡Tu primera compra argentina te está esperando!
            </p>

            <Link
              to="/productos"
              className="mt-6 inline-block rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white"
            >
              Explorar productos
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="break-all text-sm text-gray-500">
                    Pedido #{order.id.slice(0, 8)}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {order.createdAt?.toDate
                      ? order.createdAt
                          .toDate()
                          .toLocaleDateString('es-AR')
                      : 'Fecha pendiente'}
                  </p>
                </div>

                <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-6 space-y-3 border-t border-sky-100 pt-5">
                <h2 className="font-semibold text-sky-900">
                  Detalle del pedido
                </h2>

                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between gap-4 text-gray-700"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="shrink-0">
                      {item.subtotal.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between gap-4 border-t border-sky-100 pt-5 text-lg font-bold text-sky-900 sm:text-xl">
                <span>Total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  )
}

