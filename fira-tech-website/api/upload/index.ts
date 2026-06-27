import { VercelRequest, VercelResponse } from '@vercel/node'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image } = req.body
  if (!image) return res.status(400).json({ error: 'image (base64 data URI) is required' })

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'fira-tech',
      resource_type: 'image',
    })
    return res.status(200).json({ url: result.secure_url, public_id: result.public_id })
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return res.status(500).json({ error: error.message || 'Upload failed' })
  }
}
