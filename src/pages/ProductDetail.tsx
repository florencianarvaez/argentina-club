import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getProductById } from '../services/productService'
import { useCart } from '../contexts/CartContext'
import type { Product } from '../types/product'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addItem, items, totalItems } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setError('')
      setProduct(null)
      setAdded(false)

      if (!id) {
        setLoading(false)
        return
      }

      try {
        const data = await getProductById(id)

        if (!cancelled) {
          setProduct(data)
        }
      } catch (err) {
        console.error(err)

        if (!cancelled) {
          setError('No pudimos cargar este producto.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-lg text-sky-900">
          Cargando producto...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-sky-50 p-8 text-center">
        <p className="text-red-600">{error}</p>

        <Link
          to="/productos"
          className="mt-4 inline-block text-sky-700 hover:underline"
        >
          Volver al catálogo
        </Link>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-sky-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-sky-900">
          Producto no encontrado
        </h1>

        <Link
          to="/productos"
          className="mt-4 inline-block text-sky-700 hover:underline"
        >
          Volver al catálogo
        </Link>
      </main>
    )
  }

  const emoji =
    product.category === 'mates'
      ? '🧉'
      : product.category === 'yerbas'
        ? '🌿'
        : product.category === 'dulces'
          ? '🍫'
          : product.category === 'kits'
            ? '🎁'
            : '🇦🇷'

  const quantityInCart =
    items.find((item) => item.product.id === product.id)?.quantity ?? 0

  const canAdd = product.stock > quantityInCart && product.active

  function handleAddToCart() {
    if (!product || !canAdd) return

    addItem(product)
    setAdded(true)
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/productos"
            className="font-medium text-sky-700 hover:underline"
          >
            ← Volver a productos
          </Link>

          <Link
            to="/carrito"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-sky-900 shadow-sm hover:bg-sky-100"
          >
            🛒 Mi carrito ({totalItems})
          </Link>
        </div>

        <div className="grid gap-10 overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-2">

          <div className="flex min-h-96 items-center justify-center bg-sky-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full max-h-[500px] w-full object-contain p-8"
              />
            ) : (
              <span className="text-9xl">{emoji}</span>
            )}
          </div>

          <div className="flex flex-col justify-center p-8 md:p-12">

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sky-700">
              {product.category}
            </p>

            <h1 className="text-4xl font-bold text-sky-950">
              {product.name}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {product.description}
            </p>

            <p className="mt-8 text-4xl font-bold text-sky-900">
              {product.price.toFixed(2)} €
            </p>

            <p className="mt-4 text-sm text-gray-600">
              {product.stock > 0
                ? `✅ Disponible — ${product.stock} unidades`
                : '❌ Sin stock'}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              En tu carrito: {quantityInCart}
            </p>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="mt-8 rounded-xl bg-sky-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canAdd
                ? '🛒 Agregar al carrito'
                : 'No hay más unidades disponibles'}
            </button>

            {added && (
              <div
                role="status"
                className="mt-4 rounded-xl bg-green-50 p-4 text-green-800"
              >
                ¡Producto agregado correctamente! 💚
                <Link
                  to="/carrito"
                  className="ml-2 font-semibold underline"
                >
                  Ver carrito
                </Link>
              </div>
            )}

            <p className="mt-6 text-sm text-gray-500">
              Un pedacito de casa, estés donde estés. 🇦🇷
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}

