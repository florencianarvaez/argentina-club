import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Register from './pages/Register'
import Login from './pages/Login'
import MyOrders from './pages/MyOrders'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/productos" element={<Products />} />

        <Route
          path="/productos/:id"
          element={<ProductDetail />}
        />

        <Route path="/carrito" element={<Cart />} />

        <Route path="/registro" element={<Register />} />

        <Route path="/login" element={<Login />} />

        {/* Rutas para usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos" element={<MyOrders />} />
        </Route>

        {/* Rutas exclusivas para administradores */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route
            path="/admin/productos"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/pedidos"
            element={<AdminOrders />}
          />
        </Route>

        <Route
          path="*"
          element={
            <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 px-6 text-center">
              <h1 className="text-3xl font-bold text-sky-900">
                Página no encontrada
              </h1>

              <Link
                to="/"
                className="mt-5 text-sky-700 underline"
              >
                Volver al inicio
              </Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

