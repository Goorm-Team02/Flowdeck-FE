import ActivityBar from './ActivityBar'
import ChatPanel from './ChatPanel'
import EditorArea from './EditorArea'
import FileTreePanel from './FileTreePanel'
import TopBar from './TopBar'

export default function WorkspaceLayout() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <FileTreePanel />
        <EditorArea />
        <ChatPanel />
      </div>
    </div>
  )
}
