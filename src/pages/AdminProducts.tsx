import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import {
  createProduct,
  getAllProducts,
  toggleProductActive,
  updateProduct,
  type ProductFormData,
} from '../services/adminProductService'

import type { Product, ProductCategory } from '../types/product'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'mates', label: '🧉 Mates' },
  { value: 'yerbas', label: '🌿 Yerbas' },
  { value: 'dulces', label: '🍫 Dulces' },
  { value: 'snacks', label: '🍪 Snacks' },
  { value: 'sabores', label: '🇦🇷 Sabores' },
  { value: 'kits', label: '🎁 Kits' },
]

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'mates',
  imageUrl: '',
  stock: 0,
  active: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm })

  async function loadProducts() {
    try {
      const data = await getAllProducts()
      setProducts(data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('No pudimos cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function startEditing(product: Product) {
    setEditingId(product.id)

    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
      active: product.active,
    })

    setError('')
    setSuccess('')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditing() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    if (!form.description.trim()) {
      setError('La descripción es obligatoria.')
      return
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      setError('El precio debe ser mayor que cero.')
      return
    }

    if (
      !Number.isInteger(form.stock) ||
      form.stock < 0
    ) {
      setError('El stock debe ser un número entero positivo o cero.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const productData: ProductFormData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    }

    try {
      if (editingId) {
        await updateProduct(editingId, productData)
        setSuccess('¡Producto actualizado correctamente!')
      } else {
        await createProduct(productData)
        setSuccess('¡Producto creado correctamente!')
      }

      setEditingId(null)
      setForm({ ...emptyForm })

      await loadProducts()
    } catch (err) {
      console.error(err)
      setError('No pudimos guardar el producto. Revisá tus permisos.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(product: Product) {
    if (busyId) return

    setBusyId(product.id)
    setError('')
    setSuccess('')

    try {
      await toggleProductActive(product.id, !product.active)

      setSuccess(
        product.active
          ? 'Producto desactivado correctamente.'
          : 'Producto activado correctamente.'
      )

      await loadProducts()
    } catch (err) {
      console.error(err)
      setError('No pudimos cambiar el estado del producto.')
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
          Gestionar productos 🛍️
        </h1>

        <p className="mt-3 text-gray-600">
          Administrá el catálogo de Argentina Club.
        </p>

        {/* Mensajes */}
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

        {/* Formulario */}
        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-sky-900">
            {editingId ? 'Editar producto' : 'Agregar nuevo producto'}
          </h2>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block font-medium text-gray-700"
              >
                Nombre
              </label>

              <input
                id="product-name"
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3 outline-none focus:border-sky-500"
                placeholder="Ej. Dulce de leche"
              />
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="mb-2 block font-medium text-gray-700"
              >
                Categoría
              </label>

              <select
                id="product-category"
                value={form.category}
                onChange={(event) =>
                  updateField(
                    'category',
                    event.target.value as ProductCategory
                  )
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3"
              >
                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block font-medium text-gray-700"
              >
                Precio (€)
              </label>

              <input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  updateField('price', Number(event.target.value))
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="mb-2 block font-medium text-gray-700"
              >
                Stock
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(event) =>
                  updateField('stock', Number(event.target.value))
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="product-description"
                className="mb-2 block font-medium text-gray-700"
              >
                Descripción
              </label>

              <textarea
                id="product-description"
                required
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3"
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="product-image"
                className="mb-2 block font-medium text-gray-700"
              >
                URL de imagen (opcional)
              </label>

              <input
                id="product-image"
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  updateField('imageUrl', event.target.value)
                }
                className="w-full rounded-xl border border-sky-200 px-4 py-3"
                placeholder="https://..."
              />

              <p className="mt-2 text-xs text-gray-500">
                Más adelante conectaremos la subida de imágenes con AWS S3.
              </p>
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="product-active"
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  updateField('active', event.target.checked)
                }
                className="h-5 w-5"
              />

              <label
                htmlFor="product-active"
                className="text-gray-700"
              >
                Producto activo y visible en el catálogo
              </label>
            </div>

            <div className="flex flex-wrap gap-4 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-sky-700 px-8 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:opacity-50"
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista de productos */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-sky-900">
            Productos registrados ({products.length})
          </h2>

          {loading ? (
            <p className="mt-6 text-gray-600">
              Cargando productos...
            </p>
          ) : products.length === 0 ? (
            <p className="mt-6 text-gray-600">
              Todavía no hay productos registrados.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-sky-900">
                        {product.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {product.category}
                    </p>

                    <p className="mt-3 text-gray-600">
                      {product.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-5 font-semibold text-sky-900">
                      <span>{product.price.toFixed(2)} €</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      className="rounded-xl bg-sky-100 px-5 py-3 font-semibold text-sky-800 hover:bg-sky-200"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => void handleToggle(product)}
                      className={`rounded-xl px-5 py-3 font-semibold disabled:opacity-50 ${
                        product.active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {busyId === product.id
                        ? 'Guardando...'
                        : product.active
                          ? 'Desactivar'
                          : 'Activar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

