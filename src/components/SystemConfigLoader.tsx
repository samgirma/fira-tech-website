import React, { useState, useEffect } from 'react'

interface SystemConfigLoaderProps {
  onComplete?: () => void
}

export default function SystemConfigLoader({ onComplete }: SystemConfigLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const statusMessages = [
    'Initializing modules...',
    'Syncing environment...',
    'Finalizing setup...',
    'Loading components...',
    'Optimizing performance...',
    'System ready'
  ]

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 60) // 3 seconds total (100 * 60ms = 6000ms, but we want 3s so 100 * 30ms = 3000ms)

    // Status message cycling
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length)
    }, 600)

    // Complete loader after minimum 3 seconds + window load
    const minLoadTime = 3000
    const startTime = Date.now()

    const handleComplete = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadTime - elapsedTime)

      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onComplete?.()
        }, 500) // Fade out duration
      }, remainingTime)
    }

    // Handle window load
    if (document.readyState === 'complete') {
      handleComplete()
    } else {
      window.addEventListener('load', handleComplete)
    }

    return () => {
      clearInterval(progressInterval)
      clearInterval(statusInterval)
      window.removeEventListener('load', handleComplete)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo with pulsing animation */}
        <div className="mb-8">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            {/* Outer glow ring */}
            <div className="absolute inset-0 bg-gradient-to-br from-forest to-accent rounded-full opacity-20 animate-ping" />
            
            {/* Main logo container */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center animate-pulse">
              <img 
                src="/android-chrome-192x192.png" 
                alt="Fira Tech Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
            </div>
            
            {/* Rotating ring */}
            <div className="absolute inset-0 border-2 border-accent/30 rounded-full animate-spin" 
                 style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-accent rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gradient-gold mb-2">
            System Configuration
          </h2>
          <p className="text-accent/80 font-mono text-sm animate-pulse">
            {statusMessages[statusIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-forest/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-forest to-accent rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            {progress}% Complete
          </div>
        </div>

        {/* Additional system info */}
        <div className="mt-8 text-xs text-muted-foreground/60 font-mono space-y-1">
          <div>Version 1.0.0</div>
          <div>Environment: Production</div>
          <div>Status: {progress === 100 ? 'Ready' : 'Loading'}</div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-accent/20" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-accent/20" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-accent/20" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-accent/20" />
    </div>
  )
}
