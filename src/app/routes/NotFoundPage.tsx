import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-bg-primary text-text-primary font-sans">
      <div className="text-accent">
        <AlertCircle size={80} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2">404</h1>
        <p className="text-xl text-text-muted font-medium">Page not found</p>
      </div>
      <Link 
        to="/" 
        className="flex items-center gap-2 rounded-md bg-accent px-8 py-3 text-white font-bold hover:bg-accent-hover shadow-lg transition-all active:scale-95"
      >
        <Home size={20} />
        Back to Safety
      </Link>
    </div>
  )
}
