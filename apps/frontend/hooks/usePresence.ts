import { useEffect, useState, useRef } from 'react'
import { createClient } from '@fluxsql/backend/supabase/client'

export type PresenceUser = {
  user_id: string
  name: string
  joined_at: string
}

export function usePresence(
  projectId: string,
  currentUser: { id: string; name: string } | null
) {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!currentUser || !projectId) return

    const supabase = createClient()
    const channel = supabase.channel(`presence:${projectId}`, {
      config: { presence: { key: currentUser.id } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users = Object.values(state).flat()
        setPresenceUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: PresenceUser[] }) => {
        setPresenceUsers(prev => {
          const ids = new Set(prev.map(u => u.user_id))
          return [...prev, ...newPresences.filter(p => !ids.has(p.user_id))]
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: PresenceUser[] }) => {
        const leftIds = new Set(leftPresences.map(p => p.user_id))
        setPresenceUsers(prev => prev.filter(u => !leftIds.has(u.user_id)))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            joined_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [projectId, currentUser?.id])

  return presenceUsers
}
