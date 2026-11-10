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

  let token: string

  try {
    token = await user.getIdToken()
  } catch (error) {
    console.error('Error al obtener token de Firebase:', error)

    throw new Error(
      'No pudimos verificar tu sesión de Firebase. Revisá tu conexión e iniciá sesión nuevamente.'
    )
  }

  // PASO 1: SOLICITAR AUTORIZACIÓN A VERCEL
  let response: Response

  try {
    response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contentType: file.type,
      }),
    })
  } catch (error) {
    console.error('Error de conexión con Vercel:', error)

    throw new Error(
      'No pudimos conectar con Vercel para autorizar la imagen. Revisá tu conexión.'
    )
  }

  if (!response.ok) {
    const details = await response.text()

    console.error('Error de autorización:', {
      status: response.status,
      details,
    })

    throw new Error(
      `Vercel rechazó la autorización de subida (HTTP ${response.status}).`
    )
  }

  let uploadData: UploadUrlResponse

  try {
    uploadData = (await response.json()) as UploadUrlResponse
  } catch (error) {
    console.error('Respuesta inválida de Vercel:', error)

    throw new Error(
      'Vercel respondió, pero no pudimos interpretar la autorización.'
    )
  }

  const { uploadUrl, key } = uploadData

  if (
    typeof uploadUrl !== 'string' ||
    typeof key !== 'string' ||
    !uploadUrl.startsWith('https://') ||
    !key.startsWith('products/')
  ) {
    throw new Error(
      'Vercel devolvió datos incompletos para subir la imagen.'
    )
  }

  // PASO 2: SUBIR IMAGEN A AWS S3
  let uploadResponse: Response

  try {
    uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })
  } catch (error) {
    console.error('Error de conexión con AWS S3:', error)

    throw new Error(
      'No pudimos conectar con AWS S3. Puede ser un problema de CORS, de conexión o de la firma de subida.'
    )
  }

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text()

    console.error('AWS S3 rechazó la imagen:', {
      status: uploadResponse.status,
      details,
    })

    throw new Error(
      `AWS S3 rechazó la imagen (HTTP ${uploadResponse.status}).`
    )
  }

  // PASO 3: DEVOLVER LA REFERENCIA DE S3
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

  let response: Response

  try {
    response = await fetch(
      `/api/image-url?key=${encodeURIComponent(imageKey)}`
    )
  } catch (error) {
    console.error('Error al solicitar imagen:', error)

    throw new Error(
      'No pudimos conectar con el servidor para obtener la imagen.'
    )
  }

  if (!response.ok) {
    throw new Error(
      `No pudimos obtener la imagen del producto (HTTP ${response.status}).`
    )
  }

  const data = (await response.json()) as ImageUrlResponse

  if (!data.imageUrl) {
    throw new Error(
      'El servidor no devolvió una URL válida para la imagen.'
    )
  }

  return data.imageUrl
}

