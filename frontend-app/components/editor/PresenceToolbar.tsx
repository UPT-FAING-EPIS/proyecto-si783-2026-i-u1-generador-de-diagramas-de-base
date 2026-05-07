'use client'

import { usePresence } from '@/hooks/usePresence'
import { getInitials, getAvatarColor } from '@/lib/utils/avatar'

interface PresenceToolbarProps {
  projectId: string
  currentUser: { id: string; name: string }
}

export function PresenceToolbar({ projectId, currentUser }: PresenceToolbarProps) {
  const presenceUsers = usePresence(projectId, currentUser)
  const users = [
    { user_id: currentUser.id, name: currentUser.name, joined_at: '' },
    ...presenceUsers.filter((user) => user.user_id !== currentUser.id),
  ]

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1">
      {users.slice(0, 5).map((user, index) => (
        <div
          key={user.user_id}
          title={user.user_id === currentUser.id ? `${user.name} (tú)` : user.name}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold text-white"
          style={{
            backgroundColor: getAvatarColor(user.name),
            borderColor: '#0D1117',
            marginLeft: index > 0 ? '-8px' : 0,
            zIndex: 20 - index,
            position: 'relative',
          }}
        >
          {getInitials(user.name)}
        </div>
      ))}
      {users.length > 5 && <span className="ml-1 text-xs text-[#94A3B8]">+{users.length - 5}</span>}
    </div>
  )
}
