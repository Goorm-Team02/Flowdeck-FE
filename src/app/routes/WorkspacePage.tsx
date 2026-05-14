// src/app/routes/WorkspacePage.tsx
import { useParams } from 'react-router-dom'

export default function WorkspacePage() {
  const { projectId } = useParams()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Workspace: {projectId}</h1>
    </div>
  )
}
