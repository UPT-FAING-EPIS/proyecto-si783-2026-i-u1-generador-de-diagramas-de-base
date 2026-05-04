'use client'

import { useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Code2 } from 'lucide-react'
import { EditorPanel } from './EditorPanel'
import { Canvas } from './Canvas'
import { EditorToolbar } from './EditorToolbar'
import { useEditorStore } from '@/store/useEditorStore'
import { useCollaboratorCursors } from '@/hooks/useCollaboratorCursors'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { CollaboratorCursors } from './CollaboratorCursors'
import { OnboardingTour } from '@/components/editor/OnboardingTour'

interface EditorLayoutProps {
  projectName: string
  projectId: string
  initialSQL?: string
  initialNodes?: any[]
  initialEdges?: any[]
  dialect?: string
  currentUser: { id: string, name: string }
  initialIsPublic?: boolean
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setIsTablet(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isTablet
}

function EditorLayoutInner({
  projectName,
  projectId,
  initialSQL,
  initialNodes = [],
  initialEdges = [],
  dialect = 'postgresql',
  currentUser,
  initialIsPublic = false
}: EditorLayoutProps) {
  const setSqlValue = useEditorStore((state) => state.setSqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)

  const isTablet = useIsTablet()
  const [showEditor, setShowEditor] = useState(true)

  const { cursors, handleMouseMove } = useCollaboratorCursors(projectId, currentUser.id, currentUser.name)
  const { emitNodeMove, emitSqlChange } = useRealtimeSync(projectId, currentUser.id)

  useEffect(() => {
    if (initialSQL) setSqlValue(initialSQL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodesAndEdges(initialNodes, initialEdges)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="h-screen flex flex-col bg-[#0A0F1E] text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      <OnboardingTour />
      {/* Header with Toolbar */}
      <EditorToolbar projectId={projectId} projectName={projectName} dialect={dialect} initialIsPublic={initialIsPublic} />

      {/* Main — split 40/60 */}
      <div className={(!isTablet || showEditor) ? "flex-1 grid grid-cols-[40%_60%] min-h-0" : "flex-1 block min-h-0"}>
        {/* Left — Monaco SQL Editor */}
        {(!isTablet || showEditor) && (
          <div className="h-full min-h-0 border-r border-[#1E2A45]">
            <EditorPanel emitSqlChange={emitSqlChange} />
          </div>
        )}

        {/* Right — React Flow Canvas */}
        <div className="h-full min-h-0 relative">
          {isTablet && (
            <button
              onClick={() => setShowEditor(prev => !prev)}
              className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-[#111827] border border-[#1E2A45] rounded-lg text-xs text-[#9CA3AF] hover:text-white transition-colors min-w-10 min-h-10"
            >
              <Code2 size={14} />
              {showEditor ? 'Ocultar código' : 'Ver código'}
            </button>
          )}
          <Canvas emitNodeMove={emitNodeMove} />
        </div>
      </div>

      {/* Cursores Colaborativos superpuestos */}
      <CollaboratorCursors cursors={cursors} />
    </div>
  )
}

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  )
}
