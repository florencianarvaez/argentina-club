import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getAllOrders,
  updateOrderStatus,
} from '../services/adminOrderService'

import type { Order, OrderStatus } from '../types/order'

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: '⏳ Pendiente' },
  { value: 'processing', label: '📦 En preparación' },
  { value: 'shipped', label: '🚚 Enviado' },
  { value: 'delivered', label: '✅ Entregado' },
  { value: 'cancelled', label: '❌ Cancelado' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadOrders() {
    try {
      const data = await getAllOrders()
      setOrders(data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('No pudimos cargar los pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  async function handleStatusChange(
    orderId: string,
    status: OrderStatus
  ) {
    if (busyId) return

    setBusyId(orderId)
    setError('')
    setSuccess('')

    try {
      await updateOrderStatus(orderId, status)
      await loadOrders()

      setSuccess('¡Estado del pedido actualizado correctamente!')
    } catch (err) {
      console.error(err)
      setError('No pudimos actualizar el estado del pedido.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/admin"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Volver al panel
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-sky-900">
          Gestionar pedidos 📦
        </h1>

        <p className="mt-3 text-gray-600">
          Consultá las compras y actualizá su estado.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl bg-green-50 p-4 text-green-800"
          >
            {success}
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-gray-600">
            Cargando pedidos...
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            <span className="text-6xl">📦</span>

            <h2 className="mt-5 text-2xl font-bold text-sky-900">
              Todavía no hay pedidos
            </h2>

            <p className="mt-3 text-gray-600">
              Los pedidos aparecerán acá cuando los clientes compren.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">

                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido #{order.id.slice(0, 8)}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Cliente: {order.userId}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Fecha:{' '}
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString(
                            'es-AR'
                          )
                        : 'Fecha pendiente'}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`status-${order.id}`}
                      className="mb-2 block text-sm font-semibold text-sky-900"
                    >
                      Estado del pedido
                    </label>

                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      disabled={busyId !== null}
                      onChange={(event) =>
                        void handleStatusChange(
                          order.id,
                          event.target.value as OrderStatus
                        )
                      }
                      className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sky-900 disabled:opacity-50"
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="mt-6 border-t border-sky-100 pt-5">
                  <h3 className="font-semibold text-sky-900">
                    Productos comprados
                  </h3>

                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between gap-4 text-gray-700"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>

                        <span>
                          {item.subtotal.toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between border-t border-sky-100 pt-5 text-xl font-bold text-sky-900">
                  <span>Total del pedido</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

