import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminDashboard() {
  const { profile } = useAuth()

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <div className="mt-10">
          <p className="font-semibold uppercase tracking-widest text-sky-700">
            Argentina Club 🇦🇷
          </p>

          <h1 className="mt-3 text-4xl font-bold text-sky-950">
            Panel de administración
          </h1>

          <p className="mt-4 text-gray-600">
            Bienvenida, {profile?.displayName || 'administradora'}.
            Desde acá podés gestionar tu tienda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <Link
            to="/admin/productos"
            className="rounded-3xl bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="text-5xl">🛍️</span>

            <h2 className="mt-6 text-2xl font-bold text-sky-900">
              Gestionar productos
            </h2>

            <p className="mt-3 text-gray-600">
              Agregá nuevos productos, modificá precios,
              actualizá el stock y administrá el catálogo.
            </p>

            <p className="mt-8 font-semibold text-sky-700">
              Administrar productos →
            </p>
          </Link>

          <Link
            to="/admin/pedidos"
            className="rounded-3xl bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="text-5xl">📦</span>

            <h2 className="mt-6 text-2xl font-bold text-sky-900">
              Gestionar pedidos
            </h2>

            <p className="mt-3 text-gray-600">
              Consultá las compras realizadas y actualizá
              el estado de cada pedido.
            </p>

            <p className="mt-8 font-semibold text-sky-700">
              Administrar pedidos →
            </p>
          </Link>

        </div>

        <div className="mt-10 rounded-2xl border border-sky-200 bg-white p-6">
          <p className="text-sm text-gray-600">
            🔒 Este panel está reservado para usuarios con rol
            <strong> admin</strong>.
          </p>
        </div>

      </div>
    </main>
  )
}

