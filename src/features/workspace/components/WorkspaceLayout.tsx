import { useAtomValue } from 'jotai'
import ActivityBar from './ActivityBar'
import ChatPanel from './ChatPanel'
import EditorArea from './EditorArea'
import FileTreePanel from './FileTreePanel'
import SearchPanel from './SearchPanel'
import TopBar from './TopBar'
import { activeSidebarPanelAtom } from '../stores/sidebarAtom'

export default function WorkspaceLayout() {
  const activeSidebarPanel = useAtomValue(activeSidebarPanelAtom)

  return (
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        {activeSidebarPanel === 'filetree' ? <FileTreePanel /> : <SearchPanel />}
        <EditorArea />
        <ChatPanel />
      </div>
    </div>
  )
}
