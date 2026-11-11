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
  { value: 'completed', label: '✅ Completado' },
  { value: 'shipped', label: '🚚 Enviado' },
  { value: 'delivered', label: '🏠 Entregado' },
  { value: 'cancelled', label: '❌ Cancelado' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [statusFilter, setStatusFilter] = useState<
    OrderStatus | 'all'
  >('all')

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

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter)

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Volver al panel
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-sky-900 sm:text-4xl">
          Gestionar pedidos 📦
        </h1>

        <p className="mt-3 text-gray-600">
          Consultá las compras, filtrá pedidos y actualizá su estado.
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

        {!loading && orders.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
            <label
              htmlFor="status-filter"
              className="mb-3 block font-semibold text-sky-900"
            >
              Filtrar pedidos por estado
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as OrderStatus | 'all'
                )
              }
              className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sky-900 sm:max-w-xs"
            >
              <option value="all">📋 Todos los pedidos</option>

              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className="mt-3 text-sm text-gray-500">
              Mostrando {filteredOrders.length} de {orders.length} pedidos
            </p>
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
        ) : filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <span className="text-5xl">🔎</span>

            <h2 className="mt-4 text-xl font-bold text-sky-900">
              No hay pedidos con este estado
            </h2>

            <p className="mt-2 text-gray-600">
              Probá seleccionar otro filtro.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido #{order.id.slice(0, 8)}
                    </p>

                    <p className="mt-2 break-all text-sm text-gray-600">
                      Cliente: {order.userId}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Fecha:{' '}
                      {order.createdAt?.toDate
                        ? order.createdAt
                            .toDate()
                            .toLocaleDateString('es-AR')
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
                      className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sky-900 disabled:opacity-50"
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

                        <span className="shrink-0">
                          {item.subtotal.toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-4 border-t border-sky-100 pt-5 text-lg font-bold text-sky-900 sm:text-xl">
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

