import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'
import { cn } from '../../lib/utils'
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Copy,
  Check,
} from 'lucide-react'

interface MediaItem {
  url: string
  public_id: string
}

export default function MediaPage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const stats = await api.getSiteStats()
      const mediaStats = stats.find((s: any) => s.key === 'media')
      if (mediaStats?.value) {
        const parsed = typeof mediaStats.value === 'string' ? JSON.parse(mediaStats.value) : mediaStats.value
        if (Array.isArray(parsed)) {
          setImages(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load media:', error)
    }
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const result = await api.uploadImage(base64)
        setImages((prev) => [{ url: result.url, public_id: result.public_id }, ...prev])
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Upload failed. Please try again.')
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      console.error('Failed to copy URL')
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Media</h1>
        <p className="page-subtitle">Upload and manage your images</p>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'card mb-6 border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-brand-400 bg-brand-50' : 'border-surface-200 hover:border-surface-300'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="card-content flex flex-col items-center justify-center py-12">
          {isUploading ? (
            <Loader2 size={32} className="animate-spin text-brand-500 mb-3" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
              <Upload size={24} className="text-surface-400" />
            </div>
          )}
          <p className="text-sm font-medium text-surface-700">
            {isUploading ? 'Uploading...' : 'Drop an image here or click to upload'}
          </p>
          <p className="text-xs text-surface-400 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-0.5 hover:bg-red-100 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.public_id} className="card group relative overflow-hidden">
              <div className="aspect-square bg-surface-100">
                <img
                  src={image.url}
                  alt={image.public_id}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleCopyUrl(image.url, image.public_id)}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-surface-50 transition-colors"
                  title="Copy URL"
                >
                  {copiedId === image.public_id ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-surface-700" />
                  )}
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs text-surface-500 truncate">{image.public_id.split('/').pop()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <ImageIcon size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No images yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Upload your first image to get started. Drag and drop or click the upload area above.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
