import { Router } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
})

// POST /api/upload - Upload image to Cloudinary
router.post('/', authenticate, async (req, res) => {
  try {
    const { image, folder } = req.body

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' })
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: folder || 'fira-tech',
      resource_type: 'image',
    })

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('Upload failed:', error.message)
    return res.status(500).json({ error: error.message || 'Upload failed' })
  }
})

// DELETE /api/upload/:publicId - Delete image from Cloudinary
router.delete('/:publicId', authenticate, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId)
    
    await cloudinary.uploader.destroy(publicId)

    return res.status(200).json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete failed:', error.message)
    return res.status(500).json({ error: 'Failed to delete image' })
  }
})

export default router
