import { getAuth } from 'firebase/auth'

type UploadUrlResponse = {
  uploadUrl: string
  key: string
}

type ImageUrlResponse = {
  imageUrl: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

// SUBIR IMÁGENES A AWS S3
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('La imagen debe ser JPG, PNG o WEBP.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('La imagen no puede superar los 5 MB.')
  }

  const user = getAuth().currentUser

  if (!user) {
    throw new Error('Tenés que iniciar sesión para subir imágenes.')
  }

  const token = await user.getIdToken()

  // Solicitamos autorización temporal al servidor.
  const response = await fetch('/api/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contentType: file.type,
    }),
  })

  if (!response.ok) {
    throw new Error(
      'No pudimos obtener autorización para subir la imagen.'
    )
  }

  const { uploadUrl, key } =
    (await response.json()) as UploadUrlResponse

  // Subimos la imagen directamente a AWS S3.
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('No pudimos subir la imagen a AWS S3.')
  }

  // Devolvemos la ubicación del archivo en S3.
  return key
}

// OBTENER IMÁGENES DESDE AWS S3
export async function getProductImageUrl(
  imageKey: string
): Promise<string> {
  // Si es una URL externa, la devolvemos directamente.
  if (!imageKey.startsWith('products/')) {
    return imageKey
  }

  // Si está en AWS S3, solicitamos un enlace temporal.
  const response = await fetch(
    `/api/image-url?key=${encodeURIComponent(imageKey)}`
  )

  if (!response.ok) {
    throw new Error(
      'No pudimos obtener la imagen del producto.'
    )
  }

  const data =
    (await response.json()) as ImageUrlResponse

  return data.imageUrl
}
