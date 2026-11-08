import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, profile, loading, logout } = useAuth()

  return (
    <main className="min-h-screen bg-sky-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-sky-900">
          ARGENTINA CLUB 🇦🇷
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Un pedacito de casa, estés donde estés.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-md">
          {loading ? (
            <p>Cargando sesión...</p>
          ) : user ? (
            <>
              <h2 className="text-2xl font-semibold text-sky-900">
                ¡Hola, {profile?.displayName || user.email}! 👋
              </h2>

              <p className="mt-2 text-gray-600">
                Sesión iniciada correctamente.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Rol: {profile?.role}
              </p>

              <button
                onClick={() => void logout()}
                className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-sky-900">
                ¡Bienvenida a nuestra tienda!
              </h2>

              <p className="mt-2 text-gray-600">
                Iniciá sesión para empezar a comprar.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/login"
                  className="rounded-lg bg-sky-800 px-5 py-3 text-white"
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro"
                  className="rounded-lg border border-sky-800 px-5 py-3 text-sky-800"
                >
                  Registrarme
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

