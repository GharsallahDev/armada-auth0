'use client'

import { Suspense, lazy, useState, useCallback, useRef } from 'react'
import type { SPEObject } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

function SplineSceneLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs text-muted-foreground">Loading 3D scene...</span>
      </div>
    </div>
  )
}

export function SplineScene({ scene, className }: { scene: string; className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = useCallback((splineApp: any) => {
    // Reduce quality for better perf on lower-end devices
    setIsLoaded(true)
  }, [])

  return (
    <div className={`relative ${className || ''}`}>
      {/* Show loader until Spline fires onLoad */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <SplineSceneLoader />
        </div>
      )}
      <Suspense fallback={<SplineSceneLoader />}>
        <div
          className={`w-full h-full transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <Spline
            scene={scene}
            onLoad={handleLoad}
          />
        </div>
      </Suspense>
    </div>
  )
}
