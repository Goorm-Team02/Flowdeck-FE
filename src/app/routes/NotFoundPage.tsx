// src/app/routes/NotFoundPage.tsx
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">404 - Not Found</h1>
      <Link to="/" className="text-blue-500 underline">
        Go home
      </Link>
    </div>
  )
}
