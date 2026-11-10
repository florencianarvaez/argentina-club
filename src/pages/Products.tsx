import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import { getProductImageUrl } from '../services/imageService'
import type { Product } from '../types/product'

// Emoji según la categoría del producto
function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'mates':
      return '🧉'
    case 'yerbas':
      return '🌿'
    case 'dulces':
      return '🍫'
    case 'snacks':
      return '🍪'
    case 'kits':
      return '🎁'
    default:
      return '🇦🇷'
  }
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Guardamos las URL de visualización de cada imagen.
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  // Estados para búsqueda y filtros
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')

  // Cargar productos desde Firebase
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        console.error(err)
        setError('No pudimos cargar los productos.')
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [])

  // Obtener las imágenes de los productos
  useEffect(() => {
    let cancelled = false

    async function loadImages() {
      const urls: Record<string, string> = {}

      await Promise.all(
        products.map(async (product) => {
          if (!product.imageUrl) return

          try {
            const url = await getProductImageUrl(product.imageUrl)

            if (!cancelled) {
              urls[product.id] = url
            }
          } catch (err) {
            console.error(
              `No pudimos cargar la imagen de ${product.name}:`,
              err
            )
          }
        })
      )

      if (!cancelled) {
        setImageUrls(urls)
      }
    }

    void loadImages()

    return () => {
      cancelled = true
    }
  }, [products])

  // Debounce: esperar 300 ms antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Filtrar productos por nombre y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase().trim())

    const matchesCategory =
      category === 'all' || product.category === category

    return matchesSearch && matchesCategory
  })

  // Pantalla de carga
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-lg text-sky-900">
          Cargando productos...
        </p>
      </main>
    )
  }

  // Pantalla de error
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <p className="text-red-600">{error}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Título */}
        <h1 className="mb-3 text-4xl font-bold text-sky-900">
          Nuestros productos 🇦🇷
        </h1>

        <p className="mb-10 text-gray-600">
          Un pedacito de casa, estés donde estés.
        </p>

        {/* Buscador y filtros */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row">

          <input
            type="text"
            placeholder="🔎 Buscar productos argentinos..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-sky-200 bg-white px-5 py-3 outline-none focus:border-sky-500 sm:flex-1"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-sky-200 bg-white px-5 py-3 outline-none focus:border-sky-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="mates">🧉 Mates</option>
            <option value="yerbas">🌿 Yerbas</option>
            <option value="dulces">🍫 Dulces</option>
            <option value="snacks">🍪 Snacks</option>
            <option value="sabores">🇦🇷 Sabores</option>
            <option value="kits">🎁 Kits</option>
          </select>

        </div>

        {/* Cantidad de resultados */}
        <p className="mb-6 text-sm text-gray-500">
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1
            ? 'producto encontrado'
            : 'productos encontrados'}
        </p>

        {/* Catálogo */}
        {filteredProducts.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <span className="text-5xl">🔎</span>

            <h2 className="mt-4 text-xl font-semibold text-sky-900">
              No encontramos productos
            </h2>

            <p className="mt-2 text-gray-600">
              Probá con otra búsqueda o cambiá la categoría.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setDebouncedSearch('')
                setCategory('all')
              }}
              className="mt-6 rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
            >
              Ver todos los productos
            </button>
          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredProducts.map((product) => (

              <article
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Imagen clicable */}
                <Link
                  to={`/productos/${product.id}`}
                  aria-label={`Ver detalles de ${product.name}`}
                  className="flex h-48 items-center justify-center bg-sky-100 transition hover:bg-sky-200"
                >
                  {imageUrls[product.id] ? (
                    <img
                      src={imageUrls[product.id]}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-6xl">
                      {getCategoryEmoji(product.category)}
                    </span>
                  )}
                </Link>

                {/* Información del producto */}
                <div className="p-6">

                  <p className="mb-2 text-sm uppercase tracking-wide text-sky-700">
                    {product.category}
                  </p>

                  {/* Nombre clicable */}
                  <Link
                    to={`/productos/${product.id}`}
                    className="block"
                  >
                    <h2 className="text-xl font-bold text-sky-900 transition hover:text-sky-600">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="mt-2 text-sm text-gray-600">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between">

                    <span className="text-2xl font-bold text-sky-900">
                      {product.price.toFixed(2)} €
                    </span>

                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>

                  </div>

                  {/* Botón para ver detalles */}
                  <Link
                    to={`/productos/${product.id}`}
                    className="mt-6 block rounded-xl bg-sky-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-sky-800"
                  >
                    Ver producto →
                  </Link>

                </div>
              </article>

            ))}

          </div>

        )}

      </div>
    </main>
  )
}

