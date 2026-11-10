import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

    if (!serviceAccount) {
      throw new Error('Falta FIREBASE_SERVICE_ACCOUNT_JSON')
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    })
  }
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    initializeFirebaseAdmin()

    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const idToken = authorization.slice(7)
    const decodedToken = await getAuth().verifyIdToken(idToken)

    const userDoc = await getFirestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get()

    if (userDoc.data()?.role !== 'admin') {
      return res.status(403).json({
        error: 'Solo los administradores pueden subir imágenes',
      })
    }

    const { contentType } = req.body ?? {}

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        error: 'Formato no permitido. Usá JPG, PNG o WEBP.',
      })
    }

    const region = process.env.AWS_REGION
    const bucket = process.env.AWS_S3_BUCKET

    if (!region || !bucket) {
      throw new Error('Falta la configuración de AWS')
    }

    const extension =
      contentType === 'image/jpeg'
        ? 'jpg'
        : contentType === 'image/png'
          ? 'png'
          : 'webp'

    const key = `products/${randomUUID()}.${extension}`

    const s3 = new S3Client({ region })

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    })

    return res.status(200).json({
      uploadUrl,
      key,
    })
  } catch (error) {
    console.error('Error al generar URL de subida:', error)

    return res.status(500).json({
      error: 'No se pudo generar el enlace de subida',
    })
  }
}

