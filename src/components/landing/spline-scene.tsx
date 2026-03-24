'use client'

import { Suspense, lazy } from 'react'

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
  return (
    <Suspense fallback={<SplineSceneLoader />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
