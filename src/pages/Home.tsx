import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Home() {
  const { user, profile, loading, logout } = useAuth()
  const { totalItems } = useCart()

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Encabezado */}
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-sky-900">
            ARGENTINA CLUB 🇦🇷
          </h1>

          <p className="mt-4 text-xl text-gray-600">
            Un pedacito de casa, estés donde estés.
          </p>

          <p className="mt-3 text-gray-500">
            Productos argentinos para sentirte un poquito más cerca de casa.
          </p>
        </header>

        {/* Accesos principales: visibles para todos */}
        <nav className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/productos"
            className="rounded-xl bg-sky-800 px-7 py-4 font-semibold text-white transition hover:bg-sky-900"
          >
            🛍️ Explorar productos
          </Link>

          <Link
            to="/carrito"
            className="rounded-xl border-2 border-sky-800 bg-white px-7 py-4 font-semibold text-sky-900 transition hover:bg-sky-100"
          >
            🛒 Mi carrito ({totalItems})
          </Link>

          {user && (
            <Link
              to="/mis-pedidos"
              className="rounded-xl border-2 border-sky-800 bg-white px-7 py-4 font-semibold text-sky-900 transition hover:bg-sky-100"
            >
              📦 Mis pedidos
            </Link>
          )}

          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="rounded-xl bg-amber-500 px-7 py-4 font-semibold text-white transition hover:bg-amber-600"
            >
              ⚙️ Administración
            </Link>
          )}
        </nav>

        {/* Sesión */}
        <section className="mx-auto mt-12 max-w-2xl rounded-2xl bg-white p-8 text-center shadow-md">
          {loading ? (
            <p className="text-gray-600">
              Cargando sesión...
            </p>
          ) : user ? (
            <>
              <h2 className="text-2xl font-bold text-sky-900">
                ¡Hola, {profile?.displayName || user.email}! 👋
              </h2>

              <p className="mt-3 text-gray-600">
                ¡Qué bueno tenerte en Argentina Club!
              </p>

              <button
                onClick={() => void logout()}
                className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-sky-900">
                ¡Bienvenida a nuestra tienda!
              </h2>

              <p className="mt-3 text-gray-600">
                Explorá nuestros productos argentinos y encontrá tus favoritos.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  to="/login"
                  className="rounded-xl bg-sky-800 px-6 py-3 font-semibold text-white hover:bg-sky-900"
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro"
                  className="rounded-xl border-2 border-sky-800 px-6 py-3 font-semibold text-sky-900 hover:bg-sky-50"
                >
                  Registrarme
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Presentación */}
        <section className="mt-14 text-center">
          <h2 className="text-3xl font-bold text-sky-900">
            Sabores que nos acercan a casa 🧉
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Desde un buen mate hasta esos alfajores que tanto extrañamos.
            En Argentina Club queremos llevarte un pedacito de Argentina,
            estés donde estés.
          </p>

          <Link
            to="/productos"
            className="mt-8 inline-block rounded-xl bg-sky-700 px-8 py-4 font-semibold text-white transition hover:bg-sky-800"
          >
            Descubrir nuestra tienda →
          </Link>
        </section>

      </div>
    </main>
  )
}
