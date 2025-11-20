import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Camera as CameraIcon } from 'lucide-react'

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

const PolaroidCard = ({ src, onShare, className = '' }) => {
  return (
    <motion.div
      className={`relative w-40 h-48 bg-white rounded-md shadow-lg p-2 flex flex-col items-center cursor-grab ${className}`}
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
  const { videoRef, start, stop } = useWebcam()
  const canvasRef = useRef(null)
  const [shots, setShots] = useState([])
  const [showWebcam, setShowWebcam] = useState(false)
  const [ejecting, setEjecting] = useState(false)
  const [lastShot, setLastShot] = useState(null)

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

    setLastShot(data)
    setEjecting(true)
    setTimeout(() => {
      setShots(prev => [data, ...prev])
      setEjecting(false)
    }, 1200)
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
      <div className="relative w-full flex flex-col items-center pt-8">
        {/* Polaroid camera hero image with embedded circular lens preview */}
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://images-cdn.ubuy.co.in/6639b48421ad8b22646a4e91-polaroid-now-generation-2-i-type-instant.jpg"
            alt="Polaroid camera"
            className="w-full h-auto object-cover"
          />

          {/* Lens overlay positioned roughly where the camera lens is on the image */}
          {showWebcam && (
            <div
              className="absolute rounded-full overflow-hidden shadow-2xl border-[8px] border-neutral-200 bg-black"
              style={{
                width: '9vw',
                height: '9vw',
                minWidth: '88px',
                minHeight: '88px',
                maxWidth: '140px',
                maxHeight: '140px',
                top: '18%',
                right: '18%',
              }}
            >
              <video ref={videoRef} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Shutter button floating near bottom center of the camera image */}
          {showWebcam && (
            <button
              onClick={takeShot}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white shadow hover:shadow-md transition"
            >
              <CameraIcon className="w-4 h-4" />
              Take a Shot
            </button>
          )}

          {/* Ejecting photo animation from under the camera body */}
          <AnimatePresence>
            {ejecting && lastShot && (
              <motion.div
                initial={{ y: -10, rotate: 0, opacity: 0.95 }}
                animate={{ y: 120, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-0"
                style={{ zIndex: 20 }}
              >
                <div className="w-40 h-48 bg-white rounded-md shadow-xl p-2">
                  <div className="w-full h-32 bg-neutral-200 rounded-sm overflow-hidden">
                    <img src={lastShot} alt="eject" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 h-3 bg-neutral-100 rounded" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Open camera button directly under the image when webcam is closed */}
        {!showWebcam && (
          <button
            onClick={openCamera}
            className="mt-4 px-5 py-2.5 rounded-full bg-pink-500 text-white shadow hover:shadow-md transition"
          >
            Open Camera
          </button>
        )}
      </div>

      {/* Shots tray and board */}
      <div className="max-w-6xl mx-auto px-4 mt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="text-sm font-medium text-neutral-600 mb-3">Your Shots</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {shots.map((s, i) => (
                <PolaroidCard key={i} src={s} onShare={() => shareShot(s)} />
              ))}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="lg:col-span-2">
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
    </div>
  )
}

export default CameraPage
