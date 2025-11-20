import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Share2, Image as ImageIcon } from 'lucide-react'

function useWebcam() {
  const videoRef = useRef(null)
  const [streaming, setStreaming] = useState(false)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStreaming(true)
      }
    } catch (e) {
      console.error(e)
      alert('Could not access webcam')
    }
  }

  const stop = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
    }
    setStreaming(false)
  }

  return { videoRef, streaming, start, stop }
}

const PolaroidCard = ({ src, onShare }) => {
  return (
    <motion.div
      className="relative w-40 h-48 bg-white rounded-md shadow-lg p-2 flex flex-col items-center cursor-grab"
      whileHover={{ y: -4 }}
      style={{ userSelect: 'none' }}
      drag
      dragMomentum={false}
    >
      <div className="w-full h-32 bg-neutral-100 rounded-sm overflow-hidden">
        <img src={src} alt="shot" className="w-full h-full object-cover" />
      </div>
      <div className="mt-2 text-xs text-neutral-600">instant memory</div>
      <button
        onClick={onShare}
        className="absolute top-2 right-2 text-pink-500/0 hover:text-pink-500 transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

const CameraPage = () => {
  const { videoRef, streaming, start, stop } = useWebcam()
  const canvasRef = useRef(null)
  const [shots, setShots] = useState([])
  const [showWebcam, setShowWebcam] = useState(false)
  const [ejecting, setEjecting] = useState(false)

  const backend = import.meta.env.VITE_BACKEND_URL || ''

  const openCamera = async () => {
    setShowWebcam(true)
    await start()
  }

  const takeShot = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth
    const h = video.videoHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const data = canvas.toDataURL('image/png')

    // Animate eject
    setEjecting(true)
    setTimeout(() => {
      setShots(prev => [data, ...prev])
      setEjecting(false)
    }, 900)
  }

  const shareShot = async (src) => {
    const instagram_url = prompt('Paste your Instagram profile link (https://instagram.com/yourname)')
    if (!instagram_url) return
    try {
      const res = await fetch(`${backend}/api/polaroid/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: src, instagram_url }),
      })
      if (!res.ok) throw new Error('Failed to share')
      alert('Shared to the public wall!')
    } catch (e) {
      console.error(e)
      alert('Could not share the photo')
    }
  }

  useEffect(() => {
    return () => stop()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 text-neutral-800">
      {/* Hero with Spline */}
      <div className="relative h-[260px] w-full overflow-hidden">
        {/* Lazy import to avoid SSR concerns */}
        <SplineCover />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/80 pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24">
        {/* Polaroid Camera */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-10 border border-white flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative mx-auto w-full max-w-md aspect-[4/3] bg-neutral-100 rounded-2xl border-8 border-neutral-200 shadow-inner overflow-hidden">
              {/* Camera screen */}
              {!showWebcam && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Camera className="w-10 h-10 text-neutral-400" />
                  <div className="text-neutral-500">Click a Picture</div>
                  <button onClick={openCamera} className="px-4 py-2 rounded-full bg-pink-500 text-white shadow hover:shadow-md transition">Open Camera</button>
                </div>
              )}
              {showWebcam && (
                <div className="relative w-full h-full">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <button onClick={takeShot} className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-500 text-white shadow hover:shadow-md transition flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Take a Shot
                  </button>
                </div>
              )}
            </div>

            {/* Eject animation slot */}
            <div className="relative mt-6 h-24">
              <AnimatePresence>
                {ejecting && (
                  <motion.div
                    initial={{ y: -90, rotate: 2, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                    className="absolute left-1/2 -translate-x-1/2 w-40 h-48 bg-white rounded-md shadow-xl p-2"
                  >
                    <div className="w-full h-32 bg-neutral-200 rounded-sm" />
                    <div className="mt-2 h-3 bg-neutral-100 rounded" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Shots tray */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="text-sm font-medium text-neutral-600 mb-3">Your Shots</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {shots.map((s, i) => (
                <PolaroidCard key={i} src={s} onShare={() => shareShot(s)} />
              ))}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Board */}
        <div className="mt-10 pb-16">
          <div className="mb-3 text-sm font-medium text-neutral-600">Pin to your board (drag & drop)</div>
          <div className="min-h-[280px] rounded-3xl border bg-[url('https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRtYWRlfGVufDB8MHx8fDE3NjM2MjQzMTR8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center shadow-inner p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {shots.map((s, i) => (
              <motion.div key={`board-${i}`} className="relative" drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <PolaroidCard src={s} onShare={() => shareShot(s)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const SplineCover = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-full h-full" />
  const Spline = React.lazy(() => import('@splinetool/react-spline'))
  return (
    <React.Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100" /> }>
      <Spline default scene="https://prod.spline.design/xzUirwcZB9SOxUWt/scene.splinecode" style={{ width: '100%', height: '100%' }} />
    </React.Suspense>
  )
}

export default CameraPage
