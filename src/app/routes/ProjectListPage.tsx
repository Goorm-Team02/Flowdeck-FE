import { Plus, List, X, Settings, Users, Globe, LogOut, Terminal } from 'lucide-react'
import { useState } from 'react'

export default function ProjectListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const projects = [
    { id: '1', title: 'Flowdeck-Backend-Go', description: 'Collaborative Web IDE Backend implementation using Go and WebSockets.', updatedAt: '2 hours ago', visibility: 'Private', icon: '⚛️' },
    { id: '2', title: 'Python-Data-Analysis', description: 'Open source project for analyzing sales trends and customer behavior using Pandas.', updatedAt: 'Yesterday', visibility: 'Public', icon: '🐍' },
  ]

  return (
    <div className="flex flex-col h-screen w-full bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Navigation */}
      <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-white shadow-inner">F</div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Flowdeck <span className="text-text-muted text-sm font-normal ml-2 italic">v0.1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs text-text-muted">Server Connected</span>
          </div>
          <div className="h-8 w-[1px] bg-border"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">daywedset@gmail.com</span>
            <button className="flex items-center gap-2 px-3 py-1 text-xs border border-border rounded hover:bg-bg-tertiary transition-colors text-text-muted hover:text-white">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col p-4 shrink-0">
          <nav className="space-y-1 mb-8">
            <button className="w-full text-left px-3 py-2 bg-bg-tertiary text-white rounded-md text-sm font-medium flex items-center gap-3">
              <List size={18} className="text-accent" />
              My Projects
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-bg-tertiary rounded-md text-sm transition-colors flex items-center gap-3 text-text-muted hover:text-white">
              <Users size={18} />
              Shared with me
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-bg-tertiary rounded-md text-sm transition-colors flex items-center gap-3 text-text-muted hover:text-white">
              <Globe size={18} />
              Public Projects
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-bg-tertiary rounded-md text-sm transition-colors flex items-center gap-3 text-text-muted hover:text-white">
              <Settings size={18} />
              Settings
            </button>
          </nav>

          <div className="mt-auto">
            <div className="bg-bg-primary p-4 rounded-lg border border-border shadow-sm">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-2">Project Limit</p>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-accent shadow-[0_0_8px_rgba(0,122,204,0.4)]"></div>
              </div>
              <p className="text-[10px] mt-2 text-text-muted">3 of 5 projects used (60%)</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-8 bg-bg-primary overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back, flowdeck!</h2>
              <p className="text-sm text-text-muted">Manage your collaborative coding projects and create new ones.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-md font-semibold hover:bg-accent-hover transition-all shadow-lg hover:shadow-accent/20 active:scale-95"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Project Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-bg-secondary border border-border rounded-xl p-6 hover:border-accent transition-all cursor-pointer group flex flex-col shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-xl shadow-inner">
                    {project.icon}
                  </div>
                  <span className="px-2 py-1 bg-bg-primary border border-border rounded text-[10px] text-text-muted uppercase tracking-widest font-bold">
                    {project.visibility}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-text-muted flex-1 line-clamp-2 mb-8 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-[10px] text-text-muted uppercase tracking-tight">Last edited: {project.updatedAt}</span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-bg-secondary text-[8px] flex items-center justify-center text-white font-bold">JD</div>
                    <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-bg-secondary text-[8px] flex items-center justify-center text-white font-bold">MS</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Start Now Placeholder */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="bg-transparent border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-text-muted hover:bg-bg-secondary hover:border-accent transition-all cursor-pointer min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-3 group-hover:border-accent group-hover:text-accent transition-all">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium group-hover:text-white transition-colors">Start a new project</span>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-accent text-white flex items-center justify-between px-3 shrink-0 text-[11px] font-medium shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 rounded h-full transition-colors">
            <span>⎇ main*</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 rounded h-full transition-colors">
            <span>⟳ Synchronized</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-2">
            <Terminal size={12} />
            <span>Go / React Stack</span>
          </div>
          <span className="px-2">UTF-8</span>
          <span className="px-2 border-l border-white/20">Ln 1, Col 1</span>
        </div>
      </footer>

      {/* Modal - Elegant Dark Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-bg-secondary p-8 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Project Title</label>
                <input 
                  type="text" 
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
                  placeholder="e.g. My Awesome App" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description <span className="font-normal lowercase opacity-60">(optional)</span></label>
                <textarea 
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none h-32 transition-all resize-none placeholder:text-bg-tertiary"
                  placeholder="What is this project about?" 
                />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md bg-bg-tertiary py-3 font-semibold text-sm hover:bg-[#3e3e42] transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md bg-accent py-3 font-semibold text-sm text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
