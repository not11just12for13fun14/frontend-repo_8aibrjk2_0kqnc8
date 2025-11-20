import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

const PublicWall = () => {
  const [items, setItems] = useState([])
  const backend = import.meta.env.VITE_BACKEND_URL || ''

  const load = async () => {
    try {
      const res = await fetch(`${backend}/api/polaroid/public`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-pink-50 text-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Public Wall</h1>
          <p className="text-neutral-600 mt-2">A warm grid of shared moments</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {items.map((it) => (
            <motion.div key={it.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-3">
              <div className="bg-neutral-100 rounded-md overflow-hidden aspect-[3/4]">
                <img src={it.image_data} alt="shared" className="w-full h-full object-cover" />
              </div>
              <a href={it.instagram_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-pink-600 hover:text-pink-700">
                <Instagram className="w-4 h-4" />
                <span className="text-sm truncate max-w-[160px]">{it.instagram_url}</span>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PublicWall
