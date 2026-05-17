import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Layout } from 'lucide-react'

export default function WorkspacePage() {
  const { projectId } = useParams()
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-bg-primary text-text-primary p-8 text-center font-sans">
      <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center border border-border shadow-xl text-accent mb-2">
        <Layout size={40} />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Workspace: {projectId}</h1>
        <p className="text-text-muted max-w-md mx-auto">
          이 공간은 워크스페이스 전반 및 소켓 통신을 담당하는 다른 팀원들이 개발할 예정입니다.
        </p>
      </div>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-2 rounded-md bg-bg-secondary border border-border text-text-muted hover:text-white hover:border-accent transition-all font-medium"
      >
        <ArrowLeft size={18} />
        목록으로 돌아가기
      </Link>
    </div>
  )
}
