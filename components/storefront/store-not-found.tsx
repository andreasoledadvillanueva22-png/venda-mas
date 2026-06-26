import Link from 'next/link'

export function StoreNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Tienda no encontrada</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        La tienda que buscás no existe o el enlace es incorrecto. Verificá la URL o contactá al
        vendedor.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
