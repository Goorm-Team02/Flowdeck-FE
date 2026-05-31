import { useParams } from 'react-router-dom'

import { useAtomValue } from 'jotai'

import { useMemberSocket } from '../hooks/useMemberSocket'
import { activeSidebarPanelAtom } from '../stores/sidebarAtom'
import ActivityBar from './ActivityBar'
import ChatPanel from './ChatPanel'
import EditorArea from './EditorArea'
import FileTreePanel from './FileTreePanel'
import MemberModal from './MemberModal'
import SearchPanel from './SearchPanel'
import TopBar from './TopBar'

export default function WorkspaceLayout() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const activeSidebarPanel = useAtomValue(activeSidebarPanelAtom)

  useMemberSocket(projectId)

  return (
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        {activeSidebarPanel === 'filetree' ? <FileTreePanel /> : <SearchPanel />}
        <EditorArea />
        <ChatPanel />
      </div>
      <MemberModal />
    </div>
  )
}
