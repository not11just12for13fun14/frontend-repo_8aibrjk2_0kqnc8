import React from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import CameraPage from './components/CameraPage'
import PublicWall from './components/PublicWall'

function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-pink-600">Polaroid Play</Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200">Camera</Link>
            <Link to="/wall" className="text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200">Public Wall</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CameraPage />} />
        <Route path="/wall" element={<PublicWall />} />
      </Routes>
    </Layout>
  )
}

export default App
