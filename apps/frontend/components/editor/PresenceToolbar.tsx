'use client'

import { usePresence } from '@/hooks/usePresence'
import { getInitials, getAvatarColor } from '@/lib/utils/avatar'

interface PresenceToolbarProps {
  projectId: string
  currentUser: { id: string; name: string }
}

export function PresenceToolbar({ projectId, currentUser }: PresenceToolbarProps) {
  const presenceUsers = usePresence(projectId, currentUser)
  const others = presenceUsers.filter(u => u.user_id !== currentUser.id)

  if (others.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-2">
      <span className="text-xs mr-1" style={{ color: '#6B7280' }}>En línea:</span>
      {others.slice(0, 4).map((u, i) => (
        <div
          key={u.user_id}
          title={u.name}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white border-2 text-xs font-bold"
          style={{
            backgroundColor: getAvatarColor(u.name),
            borderColor: '#0D1117',
            marginLeft: i > 0 ? '-6px' : 0,
            zIndex: 10 - i,
            position: 'relative',
          }}
        >
          {getInitials(u.name)}
        </div>
      ))}
      {others.length > 4 && (
        <span className="text-xs ml-2" style={{ color: '#6B7280' }}>
          +{others.length - 4}
        </span>
      )}
    </div>
  )
}
