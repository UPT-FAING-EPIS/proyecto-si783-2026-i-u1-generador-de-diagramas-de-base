'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@fluxsql/backend/supabase/client'
import { useEditorStore } from '@/store/useEditorStore'
import type { Node, Edge } from '@xyflow/react'

export function useRealtimeSync(projectId: string, userId: string) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']>>(null)

  useEffect(() => {
    const supabase = createClient()
    
    // IMPORTANT: Reutilizamos el mismo canal de Presence
    const channel = supabase.channel(`room-${projectId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'node_move' }, ({ payload }) => {
        if (payload.senderId === userId) return // Anti-loop

        const localNodes = useEditorStore.getState().nodes
        const updatedNodes = localNodes.map((n) => 
          n.id === payload.nodeId ? { ...n, position: payload.position } : n
        )
        
        // setNodesAndEdges works correctly since we only want to update nodes, preserving edges
        const localEdges = useEditorStore.getState().edges
        useEditorStore.getState().setNodesAndEdges(updatedNodes, localEdges)
      })
      .on('broadcast', { event: 'sql_change' }, ({ payload }) => {
        if (payload.senderId === userId) return // Anti-loop

        const localNodes = useEditorStore.getState().nodes
        const posMap = new Map(localNodes.map(n => [n.id, n.position]))
        
        // Preserve local positions before applying schema changes
        const mergedNodes: Node[] = payload.nodes.map((n: Node) => ({
          ...n,
          position: posMap.get(n.id) ?? n.position
        }))

        useEditorStore.getState().setNodesAndEdges(mergedNodes, payload.edges)
      })
      .subscribe()

    return () => {
      // NO remover el canal en cleanup — Presence (Issue #20) lo gestiona
      // supabase.removeChannel(channel) 
    }
  }, [projectId, userId])

  const emitNodeMove = (nodeId: string, position: { x: number, y: number }) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'node_move',
      payload: { type: 'node_move', nodeId, position, senderId: userId }
    })
  }

  const emitSqlChange = (nodes: Node[], edges: Edge[]) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'sql_change',
      payload: { type: 'sql_change', nodes, edges, senderId: userId }
    })
  }

  return { emitNodeMove, emitSqlChange }
}
