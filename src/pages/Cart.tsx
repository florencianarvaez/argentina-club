import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart()

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 px-6 text-center">

        <span className="text-7xl">🛒</span>

        <h1 className="mt-6 text-3xl font-bold text-sky-900">
          Tu carrito está vacío
        </h1>

        <p className="mt-4 text-gray-600">
          ¡Todavía no agregaste ningún producto argentino!
        </p>

        <Link
          to="/productos"
          className="mt-8 rounded-xl bg-sky-700 px-8 py-4 font-semibold text-white transition hover:bg-sky-800"
        >
          Explorar productos 🇦🇷
        </Link>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/productos"
          className="font-medium text-sky-700 hover:underline"
        >
          ← Seguir comprando
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-sky-900">
          Mi carrito 🛒
        </h1>

        <p className="mt-3 text-gray-600">
          Tenés {totalItems} productos en tu carrito.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          {/* Lista de productos */}
          <section className="space-y-5 lg:col-span-2">

            {items.map(({ product, quantity }) => {
              const subtotal = product.price * quantity

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

              return (
                <article
                  key={product.id}
                  className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm sm:flex-row"
                >

                  <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-sky-100 sm:w-32">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-5xl">{emoji}</span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">

                    <div>
                      <Link
                        to={`/productos/${product.id}`}
                        className="text-xl font-bold text-sky-900 hover:underline"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        Precio unitario: {product.price.toFixed(2)} €
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                      {/* Controles de cantidad */}
                      <div className="flex items-center rounded-xl border border-sky-200">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="px-4 py-2 text-xl font-bold text-sky-900 hover:bg-sky-50"
                          aria-label={`Disminuir cantidad de ${product.name}`}
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center font-semibold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          disabled={quantity >= product.stock}
                          className="px-4 py-2 text-xl font-bold text-sky-900 hover:bg-sky-50 disabled:opacity-30"
                          aria-label={`Aumentar cantidad de ${product.name}`}
                        >
                          +
                        </button>

                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-sky-900">
                          {subtotal.toFixed(2)} €
                        </p>

                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="mt-2 text-sm font-medium text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>

                    </div>
                  </div>

                </article>
              )
            })}

          </section>

          {/* Resumen de compra */}
          <aside className="h-fit rounded-2xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-sky-900">
              Resumen de compra
            </h2>

            <div className="mt-6 flex justify-between text-gray-600">
              <span>Productos ({totalItems})</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>

            <div className="mt-4 flex justify-between text-gray-600">
              <span>Envío</span>
              <span>A calcular</span>
            </div>

            <hr className="my-6 border-sky-100" />

            <div className="flex justify-between text-xl font-bold text-sky-900">
              <span>Subtotal</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Los precios y la disponibilidad se verificarán al confirmar
              el pedido.
            </p>

            <Link
  to="/checkout"
  className="mt-8 block w-full rounded-xl bg-sky-700 px-6 py-4 text-center font-semibold text-white transition hover:bg-sky-800"
>
  Finalizar compra →
</Link>

            <button
              type="button"
              onClick={clearCart}
              className="mt-4 w-full rounded-xl border border-red-200 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50"
            >
              Vaciar carrito
            </button>

          </aside>

        </div>
      </div>
    </main>
  )
}

