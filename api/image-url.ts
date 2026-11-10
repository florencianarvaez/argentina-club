import type { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método no permitido',
    })
  }

  const key = req.query.key

  if (typeof key !== 'string' || !/^products\/[a-f0-9-]+\.(jpg|png|webp)$/.test(key)) {
    return res.status(400).json({
      error: 'Imagen no válida',
    })
  }

  try {
    const region = process.env.AWS_REGION
    const bucket = process.env.AWS_S3_BUCKET

    if (!region || !bucket) {
      throw new Error('Falta la configuración de AWS')
    }

    const s3 = new S3Client({ region })

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const imageUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    })

    return res.status(200).json({
      imageUrl,
    })
  } catch (error) {
    console.error('Error al obtener imagen:', error)

    return res.status(500).json({
      error: 'No pudimos obtener la imagen',
    })
  }
}

